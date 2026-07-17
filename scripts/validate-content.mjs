import fs from 'node:fs/promises';
import path from 'node:path';
import { SOURCE, absoluteLeak, forbiddenPath, markdownFiles, parseMarkdown, posix, validateEntry } from './content-lib.mjs';

export async function validateContent(source = SOURCE) {
  const errors = [];
  const warnings = [];
  const manifestPath = path.join(source, 'manifest.json');
  let manifest;
  try { manifest = JSON.parse(await fs.readFile(manifestPath, 'utf8')); } catch (error) { return { errors: [`manifest.json 无法读取: ${error.message}`], warnings }; }
  if (manifest.schemaVersion !== 1 || !Array.isArray(manifest.entries)) errors.push('manifest.json: schemaVersion 必须为 1 且 entries 必须是数组');
  if (absoluteLeak.test(JSON.stringify(manifest))) errors.push('manifest.json 包含本机绝对路径');
  const files = await markdownFiles(path.join(source, 'content'));
  const actual = new Set(files.map((file) => posix(path.relative(source, file))));
  const slugs = new Set(); const outputs = new Set(); const listed = new Set();
  for (const entry of manifest.entries ?? []) {
    if (forbiddenPath.test(entry.source ?? '') || forbiddenPath.test(entry.output ?? '')) errors.push(`Manifest 包含禁止路径: ${entry.source ?? entry.output}`);
    if (slugs.has(entry.slug)) errors.push(`重复 slug: ${entry.slug}`); else slugs.add(entry.slug);
    if (outputs.has(entry.output)) errors.push(`重复输出路径: ${entry.output}`); else outputs.add(entry.output);
    listed.add(entry.output);
    if (!actual.has(entry.output)) errors.push(`Manifest 文件不存在: ${entry.output}`);
  }
  for (const output of actual) if (!listed.has(output)) errors.push(`孤立导出文件: ${output}`);
  for (const file of files) {
    const rel = posix(path.relative(source, file)); const text = await fs.readFile(file, 'utf8');
    if (/fixture/i.test(text)) errors.push(`${rel}: 正式内容疑似包含 fixture`);
    if (absoluteLeak.test(text)) errors.push(`${rel}: 包含本机绝对路径`);
    if (/\[\[(?:raw|materials|inbox|\.obsidian)\//i.test(text)) errors.push(`${rel}: 包含禁止的内部 Wiki 路径`);
    const parsed = parseMarkdown(text, rel);
    errors.push(...validateEntry(parsed.data, rel));
    const match = (manifest.entries ?? []).find((entry) => entry.output === rel);
    if (match && ['slug', 'title', 'type', 'domain', 'updated'].some((key) => String(match[key]) !== String(parsed.data[key]))) errors.push(`${rel}: Manifest 与 frontmatter 不一致`);
  }
  return { errors, warnings, files: files.length };
}

if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(import.meta.filename)) {
  const result = await validateContent();
  for (const warning of result.warnings) console.warn(`警告: ${warning}`);
  for (const error of result.errors) console.error(`错误: ${error}`);
  console.log(`内容校验: ${result.files ?? 0} 篇，${result.warnings.length} 个警告，${result.errors.length} 个错误`);
  if (result.errors.length) process.exitCode = 1;
}
