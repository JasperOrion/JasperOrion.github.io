import { visit } from 'unist-util-visit';

export default function remarkCallouts() {
  return (tree) => visit(tree, 'blockquote', (node) => {
    const first = node.children?.[0]; const text = first?.type === 'paragraph' ? first.children?.[0] : undefined;
    if (text?.type !== 'text') return;
    const match = text.value.match(/^\[!([\w-]+)\]\s*(.*)$/i); if (!match) return;
    const type = match[1].toLowerCase(); const known = ['note','tip','warning','important'];
    text.value = `${known.includes(type) ? ({note:'笔记',tip:'提示',warning:'警告',important:'重要'}[type]) : type}${match[2] ? `：${match[2]}` : ''}`;
    node.data = { ...node.data, hProperties: { className: ['callout', `callout-${known.includes(type) ? type : 'generic'}`], 'data-callout': type } };
  });
}
