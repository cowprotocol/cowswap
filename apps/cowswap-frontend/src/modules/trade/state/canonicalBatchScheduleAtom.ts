import { atom } from 'jotai'

import { isEvmChain, SupportedChainId } from '@cowprotocol/cow-sdk'
import { walletInfoAtom } from '@cowprotocol/wallet'

import { atomWithQuery } from 'jotai-tanstack-query'

import {
  CanonicalBatchSchedule,
  // fetchCanonicalBatchSchedule,
  getMockCanonicalBatchSchedule,
} from '../services/canonicalBatchSchedule/getCanonicalBatchSchedule'

/**
 * Orderbook canonical batch schedule for Wait & Save.
 * Refetches when `nextBatchExpiration` passes and when chainId changes.
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

      // TODO(orderbook canonical_batch_schedule): remove the mock and uncomment the fetch.
      // return fetchCanonicalBatchSchedule(chainId)
      return getMockCanonicalBatchSchedule()
    },
    // TODO(orderbook): `nextBatchExpiration` should come from the schedule response
    // (nextBatchValidTo - minValidity - ~5s). Refetch then, because the held batch is too late to sign.
    refetchInterval: (query) => {
      const schedule = query.state.data
      if (!schedule) {
        return false
      }

      return Math.max(1_000, schedule.nextBatchExpiration * 1_000 - Date.now())
    },
    staleTime: 0,
  }
})

export const canonicalBatchNextBatchAtom = atom((get): number | undefined => {
  return get(canonicalBatchScheduleQueryAtom).data?.nextBatch
})

export const canonicalBatchCountdownTargetAtom = atom((get): number | undefined => {
  return get(canonicalBatchScheduleQueryAtom).data?.countdownTargetEpochSec
})

export const isCanonicalBatchScheduleErrorAtom = atom((get): boolean => {
  const query = get(canonicalBatchScheduleQueryAtom)

  return query.isError || (query.isFetched && !query.data)
})

function isSupportedScheduleChain(chainId: number | undefined): chainId is SupportedChainId {
  return typeof chainId === 'number' && isEvmChain(chainId)
}
