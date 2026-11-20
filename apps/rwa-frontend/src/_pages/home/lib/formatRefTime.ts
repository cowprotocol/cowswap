import { formatLocalTime } from '@/shared/lib/format'

/** `HH:mm` in `timeZone`, the user's time zone by default. `null` for an invalid `updatedAt` */
export function formatRefTime(updatedAt: string, timeZone?: string): string | null {
  const time = Date.parse(updatedAt)

  return Number.isNaN(time) ? null : formatLocalTime(time, timeZone)
}
