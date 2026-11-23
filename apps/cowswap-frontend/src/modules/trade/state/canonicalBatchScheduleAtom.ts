import { atom } from 'jotai'

import { isEvmChain, SupportedChainId } from '@cowprotocol/cow-sdk'
import { walletInfoAtom } from '@cowprotocol/wallet'

import { atomWithQuery } from 'jotai-tanstack-query'

import {
  CanonicalBatchSchedule,
  fetchCanonicalBatchSchedule,
  getOptimisticCanonicalBatchSchedule,
} from '../services/canonicalBatchSchedule/getCanonicalBatchSchedule'

/**
 * Orderbook canonical batch schedule for Wait & Save.
 * Refetches when `nextBatch` is due and when chainId changes.
 */
export const canonicalBatchScheduleQueryAtom = atomWithQuery<CanonicalBatchSchedule | null>((get) => {
  const { chainId } = get(walletInfoAtom)
  const enabled = isSupportedScheduleChain(chainId)

  return {
    queryKey: ['canonicalBatchSchedule', chainId] as const,
    enabled,
    queryFn: async (): Promise<CanonicalBatchSchedule | null> => {
      if (!isSupportedScheduleChain(chainId)) {
        return null
      }

      return fetchCanonicalBatchSchedule(chainId)
    },
    // Refetch when this batch is due. Readers use the optimistic schedule until the response arrives.
    refetchInterval: (query) => {
      const schedule = query.state.data
      if (!schedule) {
        return false
      }

      return Math.max(1_000, schedule.nextBatch * 1_000 - Date.now())
    },
    staleTime: 0,
  }
})

/** Server schedule rolled forward once `nextBatch` is due, until the refetch resolves. */
export const canonicalBatchScheduleAtom = atom((get): CanonicalBatchSchedule | undefined => {
  const schedule = get(canonicalBatchScheduleQueryAtom).data

  if (!schedule) {
    return undefined
  }

  return getOptimisticCanonicalBatchSchedule(schedule)
})

export const canonicalBatchNextBatchAtom = atom((get): number | undefined => {
  return get(canonicalBatchScheduleAtom)?.nextBatch
})

export const isCanonicalBatchScheduleErrorAtom = atom((get): boolean => {
  const query = get(canonicalBatchScheduleQueryAtom)

  return query.isError || (query.isFetched && !query.data)
})

function isSupportedScheduleChain(chainId: number | undefined): chainId is SupportedChainId {
  return typeof chainId === 'number' && isEvmChain(chainId)
}
