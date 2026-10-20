import { atom } from 'jotai'

import { localTimeOffsetAtom } from '@cowprotocol/common-hooks'
import { getCowBatchValidFrom, getServerNowSec } from '@cowprotocol/common-utils'
import { jotaiStore } from '@cowprotocol/core'

import { observe } from 'jotai-effect'

/**
 * Next canonical-batch `validFrom` (unix seconds). Always scheduled while subscribed
 * (row preview needs it even when Wait & Save is off). Uses quote skew when available,
 * otherwise local time (`timeOffset ?? 0`).
 */
export const cowBatchValidFromAtom = atom<number | undefined>(undefined)

cowBatchValidFromAtom.onMount = () => {
  let timeoutId = 0

  const unobserve = observe((get, set) => {
    clearTimeout(timeoutId)
    timeoutId = 0

    const timeOffsetSec = get(localTimeOffsetAtom) ?? 0

    const schedule = (): void => {
      const nextValidFrom = getCowBatchValidFrom(getServerNowSec(timeOffsetSec))
      set(cowBatchValidFromAtom, nextValidFrom)

      // At least 1ms so a boundary-equal clock cannot busy-loop with setTimeout(0).
      const delayMs = Math.max(1, (nextValidFrom - getServerNowSec(timeOffsetSec)) * 1000)
      timeoutId = window.setTimeout(schedule, delayMs)
    }

    schedule()
  }, jotaiStore)

  return () => {
    window.clearTimeout(timeoutId)
    unobserve()
    jotaiStore.set(cowBatchValidFromAtom, undefined)
  }
}
