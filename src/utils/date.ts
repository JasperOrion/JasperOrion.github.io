import { SITE } from '../config';
export const formatDate = (date: Date) => new Intl.DateTimeFormat(SITE.locale, SITE.dateFormat).format(date);
