# Jasper Orion

个人技术博客与计算机科学学习知识库的公开展示站点。本站使用 Astro 静态生成，内容由独立的 Obsidian Wiki 经过显式授权后导出。

## 技术栈

- Astro、TypeScript Strict、Markdown Content Collections
- KaTeX 构建期数学公式、Astro/Shiki 代码高亮
- Pagefind 构建后静态搜索
- GitHub Actions 与 GitHub Pages
- 原生 CSS Variables；无前端框架、数据库或运行时服务器

## 内容架构与隐私边界

```text
Obsidian Wiki → export-wiki → content-source → validate → prepare
→ Astro Content Collections → static pages → GitHub Pages
```

Wiki 是原始知识内容的单一真源。博客构建只读取仓库内的 `content-source/`；GitHub Actions 不读取本机 Wiki。导出工具只读 Wiki，不添加发布标记、不改 frontmatter、不重命名或删除页面。

`content-source/` 中的一切都应视为公开数据。以下内容永远不导出：`raw/`、`materials/`、`inbox/`、`.obsidian/`、`wiki/daily/`，以及没有严格设置 `publish: true` 的页面。测试文章只能保存在 `tests/fixtures/`。

## 目录

- `content-source/`：可审查、可提交的公开内容和 Manifest
- `scripts/`：只读导出、公开安全校验和 Astro 内容准备
- `.generated-content/`：构建生成目录，不提交、不手改
- `src/`：页面、组件、布局、配置和工具
- `tests/fixtures/`：导出与异常用例，不进入正式站点
- `.github/workflows/deploy.yml`：GitHub Pages 构建与部署

## 本地使用

需要 Node.js 22 和 npm。

```bash
npm install
npm run dev
npm run test
npm run content:validate
npm run build
npm run preview
```

## 发布一篇 Wiki 页面

先由内容所有者确认页面适合公开，并补齐稳定元数据：

```yaml
---
type: concept
domain: algorithms
course: algorithms
title: "贪心算法"
description: "介绍贪心选择、正确性证明和常见使用边界。"
created: 2026-07-16
updated: 2026-07-17
tags: [贪心, 算法]
status: mature
publish: true
slug: algorithms/concepts/greedy
featured: false
---
```

必填字段为 `type`、`domain`、`title`、`description`、`created`、`updated`、`tags`、`status`、`publish`、`slug`。`slug` 是永久公开 URL，不从标题临时生成；不得以 `/` 开头或结尾、包含 `..`、反斜杠或绝对路径。`stub` 页面还必须明确设置 `publish-stub: true`。

完整流程：

1. 在 Wiki 页面补充 `publish: true`、准确的 `description` 和稳定 `slug`。
2. 在博客仓库运行 `npm run content:export -- --wiki-root "D:\Learning\Note"`。
3. 审查 `content-source/` 的 Git diff，确认没有隐私信息和未经授权资源。
4. 运行 `npm run content:validate`。
5. 运行 `npm run build`。
6. 提交博客仓库；推送 `main` 后由 GitHub Actions 部署。

也可以通过 `WIKI_SOURCE_DIR` 指定 Wiki 根目录。CLI 参数优先。

## Markdown 转换

- 指向公开页面的 Wiki-link 转为博客链接；指向未公开页面的链接显示为普通文本；缺失目标产生带来源路径的警告。
- `note`、`tip`、`warning`、`important` Callout 转为语义化引用样式，未知类型保留正文并通用降级。
- KaTeX 在构建期渲染行内和块级公式。
- Mermaid v1 保留为标有说明的代码块，不宣称已实现图形渲染。
- 只复制公开页面实际引用且不在禁止目录中的本地资源；缺失资源产生警告。

## 扩展内容和外观

领域、课程、类型、标签与系列都从元数据生成；添加新领域只需新增公开内容。网站名称、作者、URL、GitHub、分页数量、导航、日期和类型名称位于 `src/config.ts`。主题颜色、排版、宽度和间距位于 `src/styles/global.css`。

## GitHub Pages

目标是用户主页仓库 `jasperorion.github.io`，因此 `astro.config.mjs` 使用 `site: https://jasperorion.github.io` 且不设置 `base`。在仓库 Settings → Pages 中选择 GitHub Actions 作为 Source。

若将来迁移到普通项目仓库，必须将 Astro `base` 改为 `/<repository>`，并重新验证内部链接、资源、canonical、RSS 和 Sitemap。自定义域名启用前，应同时修改 `SITE.url`、Astro `site`、`robots.txt`，并按 GitHub Pages 文档添加 `CNAME`。

## 常见错误

- 缺少字段、重复 slug、Manifest 漂移：运行 `npm run content:validate` 查看具体相对路径。
- 搜索在开发服务器不可用：Pagefind 索引在生产构建后生成，使用 `npm run build` 再 `npm run preview`。
- 资源缺失或被禁止：确认资源存在且不位于 `raw/`、`materials/`、`.obsidian/` 等目录。
- 本地构建成功只代表产物可生成，不代表 GitHub Pages 已完成部署。

## 许可证

仓库中的软件代码采用 [MIT License](LICENSE)。公开文章、图片、附件和其他内容不包含在 MIT 授权内，除非对应文件另有声明，默认保留所有权利。
