import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import matter from 'gray-matter';
import YAML from 'yaml';
import { ROOT, SOURCE, absoluteLeak, forbiddenPath, markdownFiles, normalizeTags, parseMarkdown, posix, validateEntry } from './content-lib.mjs';

function wikiRootArg(argv = process.argv.slice(2)) {
  const index = argv.indexOf('--wiki-root');
  return index >= 0 ? argv[index + 1] : argv.find((value) => !value.startsWith('-')) ?? process.env.WIKI_SOURCE_DIR;
}
function cleanTargetGuard(target) {
  const resolved = path.resolve(target);
  const projectTarget = path.resolve(ROOT, 'content-source');
  const temporaryFixtureTarget = path.basename(resolved) === 'content-source' && resolved.startsWith(`${path.resolve(os.tmpdir())}${path.sep}`);
  if (resolved !== projectTarget && !temporaryFixtureTarget) throw new Error(`拒绝清理非 content-source 目录: ${resolved}`);
}
function refParts(raw) {
  const [targetWithHeading, alias] = raw.split('|');
  const [target, ...heading] = targetWithHeading.split('#');
  return { target: target.trim().replace(/\\+$/g, '').replace(/\.md$/i, ''), alias: alias?.trim(), heading: heading.join('#').trim() };
}
function displayName(ref) { return ref.alias || path.posix.basename(ref.target) || ref.target; }
function assetName(source) {
  const ext = path.extname(source).toLowerCase();
  const base = path.basename(source, ext).replace(/[^\p{L}\p{N}._-]+/gu, '-').slice(0, 60) || 'asset';
  const hash = crypto.createHash('sha256').update(posix(source)).digest('hex').slice(0, 10);
  return `${base}-${hash}${ext}`;
}
function publicFrontmatter(source) {
  const keys = ['type', 'domain', 'course', 'title', 'description', 'created', 'updated', 'tags', 'status', 'publish', 'slug', 'difficulty', 'featured', 'series', 'cover', 'author', 'stability'];
  const result = Object.fromEntries(keys.filter((key) => source[key] !== undefined).map((key) => [key, source[key]]));
  if (typeof source['source-url'] === 'string' && /^https?:\/\//i.test(source['source-url'])) result['source-url'] = source['source-url'];
  return result;
}

export async function exportWiki({ wikiRoot = wikiRootArg(), output = SOURCE } = {}) {
  if (!wikiRoot) throw new Error('缺少 Wiki 路径。请使用 --wiki-root 或 WIKI_SOURCE_DIR。');
  const wiki = path.resolve(wikiRoot); const wikiDir = path.join(wiki, 'wiki');
  const stat = { scanned: 0, public: 0, exported: 0, skipped: 0, assets: 0, warnings: [], errors: [] };
  const files = await markdownFiles(wikiDir); stat.scanned = files.length;
  const pages = new Map(); const publicPages = [];
  for (const file of files) {
    const rel = posix(path.relative(wiki, file)); const key = rel.replace(/\.md$/i, '');
    const parsed = parseMarkdown(await fs.readFile(file, 'utf8'), rel);
    const eligible = !forbiddenPath.test(rel) && parsed.data.publish === true && !['index', 'meta-reference'].includes(parsed.data.type) && parsed.data.status !== 'superseded' && (parsed.data.status !== 'stub' || parsed.data['publish-stub'] === true);
    pages.set(key, { file, rel, parsed, eligible });
    if (eligible) { publicPages.push(pages.get(key)); stat.public++; } else stat.skipped++;
  }
  const slugMap = new Map(publicPages.map((page) => [page.rel.replace(/\.md$/i, ''), page.parsed.data.slug]));
  cleanTargetGuard(output);
  for (const name of ['content', 'assets']) await fs.rm(path.join(output, name), { recursive: true, force: true });
  await fs.rm(path.join(output, 'manifest.json'), { force: true });
  await fs.mkdir(path.join(output, 'content'), { recursive: true }); await fs.mkdir(path.join(output, 'assets'), { recursive: true });
  const manifestEntries = []; const usedSlugs = new Set(); const usedOutputs = new Set();
  for (const page of publicPages) {
    const data = publicFrontmatter({ ...page.parsed.data, tags: normalizeTags(page.parsed.data.tags), featured: page.parsed.data.featured ?? false });
    const errors = validateEntry(data, page.rel);
    if (usedSlugs.has(data.slug)) errors.push(`${page.rel}: 重复 slug ${data.slug}`); else usedSlugs.add(data.slug);
    if (errors.length) { stat.errors.push(...errors); continue; }
    let body = page.parsed.content.replace(/\[\[([^\]]+)\]\]/g, (_, raw) => {
      const ref = refParts(raw); const normalized = ref.target.startsWith('wiki/') ? ref.target : `wiki/${ref.target}`;
      const slug = slugMap.get(normalized); const label = displayName(ref);
      if (!ref.target) return label;
      if (slug) return `[${label}](/articles/${slug}/${ref.heading ? `#${encodeURIComponent(ref.heading)}` : ''})`;
      if (pages.has(normalized)) return label;
      stat.warnings.push(`${page.rel}: Wiki-link 目标不存在: ${ref.target}`); return label;
    });
    const assetPattern = /!\[([^\]]*)\]\(([^)]+)\)/g; const replacements = [];
    for (const match of body.matchAll(assetPattern)) {
      const raw = decodeURIComponent(match[2].trim().replace(/^<|>$/g, ''));
      if (/^(?:https?:|data:)/i.test(raw)) continue;
      const candidate = path.resolve(path.dirname(page.file), raw);
      const relAsset = posix(path.relative(wiki, candidate));
      if (relAsset.startsWith('../') || forbiddenPath.test(relAsset) || absoluteLeak.test(raw)) { stat.errors.push(`${page.rel}: 禁止资源路径 ${raw}`); continue; }
      try {
        const name = assetName(relAsset); await fs.copyFile(candidate, path.join(output, 'assets', name)); stat.assets++;
        replacements.push([match[0], `![${match[1]}](/content-assets/${name})`]);
      } catch { stat.warnings.push(`${page.rel}: 缺失资源 ${raw}`); }
    }
    for (const [from, to] of replacements) body = body.replaceAll(from, to);
    const outputRel = posix(path.join('content', `${data.slug}.md`));
    if (usedOutputs.has(outputRel)) { stat.errors.push(`${page.rel}: 重复输出路径 ${outputRel}`); continue; } usedOutputs.add(outputRel);
    const target = path.join(output, outputRel); await fs.mkdir(path.dirname(target), { recursive: true });
    await fs.writeFile(target, matter.stringify(body, data, { language: 'yaml', engines: { yaml: { stringify: (value) => YAML.stringify(value) } } }));
    manifestEntries.push({ source: page.rel, output: outputRel, slug: data.slug, title: data.title, type: data.type, domain: data.domain, updated: data.updated }); stat.exported++;
  }
  manifestEntries.sort((a, b) => a.slug.localeCompare(b.slug, 'zh-CN') || a.source.localeCompare(b.source, 'zh-CN'));
  await fs.writeFile(path.join(output, 'manifest.json'), `${JSON.stringify({ schemaVersion: 1, generatedAt: new Date().toISOString(), entries: manifestEntries }, null, 2)}\n`);
  return stat;
}

if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(import.meta.filename)) {
  try {
    const result = await exportWiki();
    console.log(`扫描页面数: ${result.scanned}\n允许公开页面数: ${result.public}\n成功导出数: ${result.exported}\n跳过页面数: ${result.skipped}\n复制资源数: ${result.assets}\n警告数: ${result.warnings.length}\n错误数: ${result.errors.length}`);
    result.warnings.forEach((v) => console.warn(`警告: ${v}`)); result.errors.forEach((v) => console.error(`错误: ${v}`));
    if (result.errors.length) process.exitCode = 1;
  } catch (error) { console.error(error.message); process.exitCode = 1; }
}
