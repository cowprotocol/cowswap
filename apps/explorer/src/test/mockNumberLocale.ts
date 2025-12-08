export function mockNumberLocale(locale: string): jest.SpyInstance {
  const numberFormat = new Intl.NumberFormat(locale)
  return jest.spyOn(Intl, 'NumberFormat').mockImplementation(() => numberFormat)
}
