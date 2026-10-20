import type { CustomAliasedTimezone, CustomTimezoneId } from 'charting_library'

export function getCustomTimezone(timezone: string, offsetMinutes: number): CustomAliasedTimezone {
  const absoluteOffset = Math.abs(offsetMinutes)
  const hours = Math.floor(absoluteOffset / 60)
  const minutes = absoluteOffset % 60
  const alias = `Etc/GMT${offsetMinutes >= 0 ? '+' : '-'}${hours}` as const

  return {
    id: `${timezone}-local` as CustomTimezoneId,
    alias: minutes ? `${alias}:${minutes}` : alias,
    title: timezone,
  }
}
