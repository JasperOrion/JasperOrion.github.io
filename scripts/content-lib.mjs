import fs from 'node:fs/promises';
import path from 'node:path';
import matter from 'gray-matter';
import YAML from 'yaml';

export const ROOT = path.resolve(import.meta.dirname, '..');
export const SOURCE = path.join(ROOT, 'content-source');
export const GENERATED = path.join(ROOT, '.generated-content');
export const posix = (value) => value.split(path.sep).join('/');
export const forbiddenPath = /(?:^|\/)(?:raw|materials|inbox|\.obsidian|daily)(?:\/|$)/i;
export const absoluteLeak = /(?:^|[\s"'(])(?:[A-Za-z]:[\\/]|file:\/\/)/i;
export const isoDate = /^\d{4}-\d{2}-\d{2}$/;

export function parseMarkdown(text) {
  return matter(text, { engines: { yaml: (source) => YAML.parse(source) } });
}

export function normalizeTags(tags) {
  return [...new Set((Array.isArray(tags) ? tags : []).map(String).map((tag) => tag.trim()).filter(Boolean))];
}

export function validateEntry(data, relativePath) {
  const errors = [];
  const required = ['type', 'domain', 'title', 'description', 'created', 'updated', 'tags', 'status', 'publish', 'slug'];
  for (const key of required) if (data[key] === undefined || data[key] === null || data[key] === '') errors.push(`${relativePath}: 缺少必填字段 ${key}`);
  if (data.publish !== true) errors.push(`${relativePath}: publish 必须严格为 true`);
  if (typeof data.slug !== 'string' || data.slug.startsWith('/') || data.slug.endsWith('/') || data.slug.includes('..') || data.slug.includes('\\') || absoluteLeak.test(data.slug ?? '')) errors.push(`${relativePath}: slug 非法`);
  for (const key of ['created', 'updated']) if (!isoDate.test(String(data[key] ?? ''))) errors.push(`${relativePath}: ${key} 必须为 YYYY-MM-DD`);
  if (isoDate.test(String(data.created)) && isoDate.test(String(data.updated)) && data.updated < data.created) errors.push(`${relativePath}: updated 不得早于 created`);
  if (!Array.isArray(data.tags)) errors.push(`${relativePath}: tags 必须是数组`);
  if (absoluteLeak.test(JSON.stringify(data))) errors.push(`${relativePath}: frontmatter 包含本机绝对路径`);
  return errors;
}

export async function markdownFiles(dir) {
  const result = [];
  async function walk(current) {
    for (const item of await fs.readdir(current, { withFileTypes: true }).catch(() => [])) {
      const full = path.join(current, item.name);
      if (item.isDirectory()) await walk(full);
      else if (item.isFile() && item.name.endsWith('.md') && item.name !== 'README.md') result.push(full);
    }
  }
  await walk(dir);
  return result.sort();
}
