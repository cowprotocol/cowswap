import { Command } from '@cowprotocol/types'

const RETRY_MS = 100

/**
 * Calls `onTick` with the remaining whole seconds right away and then once each time that value changes,
 * until it reaches zero. Sleeps between changes instead of polling.
 * `onTick` may return `false` when it could not apply the value (e.g. its target is not mounted yet) to be
 * retried after 100ms.
 * Returns a function that stops the countdown.
 */
export function runCountdown(getMsLeft: () => number, onTick: (remainingSec: number) => boolean | void): Command {
  let timeoutId: ReturnType<typeof setTimeout> | undefined
  let lastRemainingSec: number | undefined

  const tick = (): void => {
    const msLeft = getMsLeft()
    const remainingSec = Math.max(0, Math.ceil(msLeft / 1000))

    if (remainingSec !== lastRemainingSec) {
      if (onTick(remainingSec) === false) {
        timeoutId = setTimeout(tick, RETRY_MS)
        return
      }

      lastRemainingSec = remainingSec
    }

    if (remainingSec > 0) {
      // ceil(msLeft / 1000) drops by one once msLeft reaches (remainingSec - 1) * 1000. A wake-up that lands a
      // hair early due to float rounding sees the same value and reschedules for the remaining sub-millisecond.
      timeoutId = setTimeout(tick, Math.ceil(msLeft - (remainingSec - 1) * 1000))
    }
  }

  tick()

  return () => clearTimeout(timeoutId)
}
