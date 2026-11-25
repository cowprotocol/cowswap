import type { RwaTradingPause } from '@/entities/asset'

import { getLocalTimeParts } from '@/shared/lib/format'

/** `null` once the pause is over. `timeZone` is the user's by default */
export function getTradingPauseMessage(
  pause: RwaTradingPause | null | undefined,
  now: Date,
  timeZone?: string,
): string | null {
  if (!pause) return null

  const start = Date.parse(pause.start)
  const end = Date.parse(pause.end)

  if (now.getTime() >= end) return null

  const endParts = getLocalTimeParts(end, timeZone)

  if (now.getTime() >= start) {
    return `${pause.issuer} tokens are paused until ${endParts.time} while their balances update.`
  }

  const startParts = getLocalTimeParts(start, timeZone)

  return `${pause.issuer} tokens pause trading on ${startParts.month} ${startParts.day}, ${startParts.time}–${endParts.time}, while their balances update.`
}
