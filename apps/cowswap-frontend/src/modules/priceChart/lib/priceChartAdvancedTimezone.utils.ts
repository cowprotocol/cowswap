import type { CustomAliasedTimezone, CustomTimezoneId } from 'charting_library'

export function getCustomTimezone(timezone: string, offsetMinutes: number): CustomAliasedTimezone {
  const absoluteOffset = Math.abs(offsetMinutes)
  const hours = Math.floor(absoluteOffset / 60)
  const minutes = absoluteOffset % 60

  return {
    id: `${timezone}-local` as CustomTimezoneId,
    alias: offsetMinutes === 0 ? 'Etc/GMT+0' : `Etc/GMT${offsetMinutes > 0 ? '+' : '-'}${hours}:${minutes}`,
    title: timezone,
  }
}
