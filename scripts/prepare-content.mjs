import fs from 'node:fs/promises';
import path from 'node:path';
import { GENERATED, SOURCE } from './content-lib.mjs';
import { validateContent } from './validate-content.mjs';

export async function prepareContent(source = SOURCE, target = GENERATED) {
  const result = await validateContent(source);
  if (result.errors.length) throw new Error(result.errors.join('\n'));
  await fs.rm(target, { recursive: true, force: true });
  await fs.mkdir(target, { recursive: true });
  await fs.writeFile(path.join(target, 'README.md'), '# 自动生成\n\n请勿手工编辑。\n');
  await fs.cp(path.join(source, 'content'), path.join(target, 'content'), { recursive: true });
  if ((result.files ?? 0) === 0) {
    await fs.writeFile(path.join(target, 'content', '_empty.md'), `---\ntype: internal\ndomain: internal\ntitle: "Empty content marker"\ndescription: "Build-only marker for an empty collection."\ncreated: 2026-07-17\nupdated: 2026-07-17\ntags: []\nstatus: mature\npublish: true\nslug: __internal/empty\ninternal: true\n---\n`);
  }
  const sourceAssets = path.join(source, 'assets');
  await fs.mkdir(path.join(target, 'assets'), { recursive: true });
  await fs.cp(sourceAssets, path.join(target, 'assets'), { recursive: true, force: true }).catch((error) => {
    if (error.code !== 'ENOENT') throw error;
  });
  const publicAssets = path.join(path.dirname(target), 'public', 'content-assets');
  await fs.rm(publicAssets, { recursive: true, force: true });
  await fs.mkdir(publicAssets, { recursive: true });
  await fs.cp(sourceAssets, publicAssets, { recursive: true, force: true }).catch((error) => {
    if (error.code !== 'ENOENT') throw error;
  });
  return result;
}

if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(import.meta.filename)) {
  const result = await prepareContent();
  console.log(`内容准备完成: ${result.files ?? 0} 篇`);
}
