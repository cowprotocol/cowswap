import type { RwaTradingPause } from '@/entities/asset'

const dateFormatter = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' })
const timeFormatter = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' })

/** `null` once the pause is over */
export function getTradingPauseMessage(pause: RwaTradingPause | null | undefined, now: Date): string | null {
  if (!pause) return null

  const start = Date.parse(pause.start)
  const end = Date.parse(pause.end)

  if (now.getTime() >= end) return null
  if (now.getTime() >= start) {
    return `${pause.issuer} tokens are paused until ${timeFormatter.format(end)} UTC while their balances update.`
  }

  return `${pause.issuer} tokens pause trading on ${dateFormatter.format(start)}, ${timeFormatter.format(start)}–${timeFormatter.format(end)} UTC, while their balances update.`
}
