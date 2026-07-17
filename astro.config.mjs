import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import remarkCallouts from './scripts/remark-callouts.mjs';
import { unified } from '@astrojs/markdown-remark';

export default defineConfig({
  site: 'https://jasperorion.github.io',
  output: 'static',
  integrations: [sitemap()],
  markdown: {
    processor: unified({ remarkPlugins: [remarkMath, remarkCallouts], rehypePlugins: [[rehypeKatex, { strict: 'ignore' }]] }),
    shikiConfig: { themes: { light: 'github-light', dark: 'github-dark' }, wrap: false }
  }
});
