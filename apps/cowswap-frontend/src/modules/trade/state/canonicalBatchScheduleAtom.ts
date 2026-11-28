import { atom } from 'jotai'

import { localTimeOffsetAtom } from '@cowprotocol/common-hooks'
import { getServerNowSec } from '@cowprotocol/common-utils'
import { jotaiStore } from '@cowprotocol/core'
import { isEvmChain, SupportedChainId } from '@cowprotocol/cow-sdk'
import { walletInfoAtom } from '@cowprotocol/wallet'

import { observe } from 'jotai-effect'
import { atomWithQuery } from 'jotai-tanstack-query'

import {
  CanonicalBatchSchedule,
  fetchCanonicalBatchSchedule,
  getOptimisticCanonicalBatchSchedule,
} from '../services/canonicalBatchSchedule/getCanonicalBatchSchedule'

/** Failed refetch keeps the last schedule. Polling a past `nextBatch` would clamp to 1s for the outage. */
const SCHEDULE_ERROR_REFETCH_INTERVAL_MS = 30_000

/**
 * Orderbook canonical batch schedule for Wait & Save.
 * Refetches when `nextBatch` is due, backs off while that refetch is failing, and refetches when chainId changes.
 */
export const canonicalBatchScheduleQueryAtom = atomWithQuery<CanonicalBatchSchedule | null>((get) => {
  const { chainId } = get(walletInfoAtom)
  const timeOffsetSec = get(localTimeOffsetAtom)
  const enabled = isSupportedScheduleChain(chainId)

  return {
    queryKey: ['canonicalBatchSchedule', chainId] as const,
    enabled,
    queryFn: async ({ signal }): Promise<CanonicalBatchSchedule | null> => {
      if (!isSupportedScheduleChain(chainId)) {
        return null
      }

      return fetchCanonicalBatchSchedule(chainId, signal)
    },
    // Refetch when this batch is due. Readers use the optimistic schedule until the response arrives.
    refetchInterval: (query) => {
      const schedule = query.state.data
      if (!schedule) {
        return false
      }

      if (query.state.status === 'error') {
        return SCHEDULE_ERROR_REFETCH_INTERVAL_MS
      }

      return Math.max(1_000, schedule.nextBatch * 1_000 - getServerNowSec(timeOffsetSec) * 1_000)
    },
    staleTime: 0,
  }
})

// Query data stays put while a refetch is in flight, so readers need a tick at nextBatch.
const canonicalBatchScheduleClockAtom = atom(0)

canonicalBatchScheduleClockAtom.onMount = () => {
  let timeoutId = 0

  const unobserve = observe((get, set) => {
    get(localTimeOffsetAtom)
    get(canonicalBatchScheduleQueryAtom)

    const scheduleTick = (): void => {
      window.clearTimeout(timeoutId)
      timeoutId = 0

      const timeOffsetSec = jotaiStore.get(localTimeOffsetAtom)
      const schedule = jotaiStore.get(canonicalBatchScheduleQueryAtom).data

      if (!schedule) {
        return
      }

      const serverNowSec = getServerNowSec(timeOffsetSec)
      const optimistic = getOptimisticCanonicalBatchSchedule(schedule, serverNowSec * 1_000)
      // At least 1ms so a boundary-equal clock cannot busy-loop with setTimeout(0).
      const delayMs = Math.max(1, (optimistic.nextBatch - serverNowSec) * 1_000)
      const tick = jotaiStore.get(canonicalBatchScheduleClockAtom)

      timeoutId = window.setTimeout(() => {
        set(canonicalBatchScheduleClockAtom, tick + 1)
        scheduleTick()
      }, delayMs)
    }

    scheduleTick()
  }, jotaiStore)

  return () => {
    window.clearTimeout(timeoutId)
    unobserve()
  }
}

/** Server schedule rolled forward once `nextBatch` is due, until the refetch resolves. */
export const canonicalBatchScheduleAtom = atom((get): CanonicalBatchSchedule | undefined => {
  get(canonicalBatchScheduleClockAtom)
  const timeOffsetSec = get(localTimeOffsetAtom)
  const schedule = get(canonicalBatchScheduleQueryAtom).data

  if (!schedule) {
    return undefined
  }

  return getOptimisticCanonicalBatchSchedule(schedule, getServerNowSec(timeOffsetSec) * 1_000)
})

export const canonicalBatchNextBatchAtom = atom((get): number | undefined => {
  return get(canonicalBatchScheduleAtom)?.nextBatch
})

export const canonicalBatchIntervalSecondsAtom = atom((get): number | undefined => {
  return get(canonicalBatchScheduleAtom)?.intervalSeconds
})

export const isCanonicalBatchScheduleErrorAtom = atom((get): boolean => {
  const query = get(canonicalBatchScheduleQueryAtom)

  // A failed refetch sets isError without clearing the last schedule.
  return (query.isError || query.isFetched) && !query.data
})

function isSupportedScheduleChain(chainId: number | undefined): chainId is SupportedChainId {
  return typeof chainId === 'number' && isEvmChain(chainId)
}
