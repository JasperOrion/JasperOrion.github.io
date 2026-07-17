export const SITE = {
  title: 'Jasper Orion',
  description: '记录计算机科学、人工智能、算法与开发实践中的学习过程。',
  author: 'Jasper',
  url: 'https://jasperorion.github.io',
  language: 'zh-CN',
  locale: 'zh-CN',
  github: 'https://github.com/jasperorion',
  postsPerPage: 10,
  dateFormat: { year: 'numeric', month: 'long', day: 'numeric' } as const,
  intro: ['你好，我是 Jasper。', '这里记录计算机科学、算法、人工智能以及开发实践中的学习过程。内容会随着学习持续整理、修正和扩展。'],
  navigation: [
    { href: '/', label: '首页' }, { href: '/articles/', label: '文章' },
    { href: '/topics/', label: '领域' }, { href: '/archive/', label: '归档' },
    { href: '/search/', label: '搜索' }, { href: '/about/', label: '关于' }
  ]
} as const;

export const CONTENT_TYPE_LABELS: Record<string, string> = {
  concept: '知识点', solution: '算法题解', 'course-notes': '课程笔记',
  summary: '来源摘要', synthesis: '综合分析'
};

export const typeLabel = (type: string) => CONTENT_TYPE_LABELS[type] ?? type.replaceAll('-', ' ');
