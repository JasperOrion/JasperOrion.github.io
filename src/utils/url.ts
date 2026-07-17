import { SITE } from '../config';
export const absoluteUrl = (pathname: string) => new URL(pathname.replace(/^\/?/, '/'), SITE.url).toString();
export const articleUrl = (slug: string) => `/articles/${slug}/`;
