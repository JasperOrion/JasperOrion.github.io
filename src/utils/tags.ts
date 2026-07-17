export const routePart = (value: string) => value.replaceAll('~', '~~').replaceAll('/', '~2F');
export const normalizeTags = (tags: string[]) => [...new Set(tags.map((tag) => tag.trim()).filter(Boolean))];
