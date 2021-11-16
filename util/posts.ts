export function toPostPath(id: string, locale: string) {
  return locale === 'en' ? `${id}` : `${id}__${locale}`
}