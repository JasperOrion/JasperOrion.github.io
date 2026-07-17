import type { Article } from './content';
export const neighbors = (items: Article[], slug: string) => { const index = items.findIndex((item) => item.data.slug === slug); return { previous: index > 0 ? items[index - 1] : undefined, next: index >= 0 && index < items.length - 1 ? items[index + 1] : undefined }; };
