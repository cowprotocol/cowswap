import { SUPPORTED_LOCALES, SupportedLocale } from '@cowprotocol/common-const'

/**
 * Given a locale string (e.g. from user agent), return the best match for corresponding SupportedLocale
 * @param maybeSupportedLocale the fuzzy locale identifier
 */
export function parseLocale(maybeSupportedLocale: unknown): SupportedLocale | undefined {
  if (typeof maybeSupportedLocale !== 'string') return undefined
  const lowerMaybeSupportedLocale = maybeSupportedLocale.toLowerCase()
  return SUPPORTED_LOCALES.find(
    (locale) =>
      locale.toLowerCase() === lowerMaybeSupportedLocale || locale.split('-')[0] === lowerMaybeSupportedLocale,
  )
}

/**
 * The integrator's locale, kept between its params updates: the widget's own links (e.g. the trade type tabs) don't
 * carry the `lng` query param
 */
let widgetLocale: SupportedLocale | undefined

export function getWidgetLocale(): SupportedLocale | undefined {
  return widgetLocale
}

/** Takes the locale of the integrator's params update: an update without `lng` goes back to the device locale */
export function setWidgetLocale(lng: string | null): void {
  widgetLocale = parseLocale(lng)
}
