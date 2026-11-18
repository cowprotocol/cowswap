export interface GmtCustomTimezone<TimezoneId extends string> {
  id: TimezoneId
  alias: GmtTimezoneAlias
  title: string
}

/** TradingView `Etc/GMT` offset zone, e.g. `Etc/GMT-5:30` */
export type GmtTimezoneAlias = `Etc/GMT${'+' | '-'}${number}${`:${number}` | ''}`

/**
 * The user's current UTC offset as a TradingView custom time zone, for a zone TradingView doesn't list.
 * The `Etc/GMT` alias is a fixed offset with no daylight saving rules, so the title names the offset, not the zone.
 * `offsetMinutes` is `Date.getTimezoneOffset()`: positive west of UTC, like the inverted sign of the `Etc/GMT` zones
 */
export function getGmtCustomTimezone<TimezoneId extends string = string>(
  timezone: string,
  offsetMinutes: number,
): GmtCustomTimezone<TimezoneId> {
  const absoluteOffset = Math.abs(offsetMinutes)
  const hours = Math.floor(absoluteOffset / 60)
  const minutes = absoluteOffset % 60
  const isWestOfUtc = offsetMinutes >= 0
  const alias = `Etc/GMT${isWestOfUtc ? '+' : '-'}${hours}` as const
  const offset = `${isWestOfUtc ? '-' : '+'}${hours}${minutes ? `:${minutes}` : ''}`

  return {
    id: `${timezone}-local` as TimezoneId,
    alias: minutes ? `${alias}:${minutes}` : alias,
    title: offsetMinutes === 0 ? 'UTC' : `UTC${offset}`,
  }
}
