import type { Article } from './content';
export const groupByYear = (items: Article[]) => [...items.reduce((map, item) => { const year = item.data.updated.getFullYear(); map.set(year, [...(map.get(year) ?? []), item]); return map; }, new Map<number, Article[]>())].sort((a, b) => b[0] - a[0]);
