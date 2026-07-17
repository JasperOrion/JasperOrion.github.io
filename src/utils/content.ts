import { getCollection, type CollectionEntry } from 'astro:content';
export type Article = CollectionEntry<'articles'>;
const time = (value: Date) => value.getTime();
export const sortArticles = (items: Article[]) => [...items].sort((a, b) => time(b.data.updated) - time(a.data.updated) || time(b.data.created) - time(a.data.created) || a.data.title.localeCompare(b.data.title, 'zh-CN') || a.data.slug.localeCompare(b.data.slug));
export const getArticles = async () => sortArticles((await getCollection('articles')).filter((item) => item.data.publish && !item.data.internal));
export const counts = (items: Article[], pick: (item: Article) => string | undefined) => [...items.reduce((map, item) => { const key = pick(item); if (key) map.set(key, (map.get(key) ?? 0) + 1); return map; }, new Map<string, number>())].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], 'zh-CN'));
