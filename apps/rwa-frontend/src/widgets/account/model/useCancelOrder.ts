'use client'

import { useAtomValue, useSetAtom } from 'jotai'
import { useCallback } from 'react'

import { useQueryClient } from '@tanstack/react-query'
import { BaseError, isHash, type ReplacementReason, UserRejectedRequestError } from 'viem'
import { useConfig } from 'wagmi'
import { waitForTransactionReceipt } from 'wagmi/actions'

import { normalizeError } from '@cowprotocol/common-utils/errors'

import { type OrderCancellation, orderCancellationsAtom, setOrderCancellationAtom } from './orderCancellations'

import { cancelCowShedTwap } from '../api/cancelCowShedTwap'
import { cancelOrder, type CancellationType } from '../api/cancelOrder'

import type { OpenOrder } from '../api/openOrders'

import { RWA_QUERY_KEY_ROOT } from '@/shared/api'
import { trackEvent } from '@/shared/lib/analytics'

const USER_REJECTED_CODE = 4001

export function useCancelOrder(): (order: OpenOrder, type: CancellationType) => Promise<void> {
  const config = useConfig()
  const queryClient = useQueryClient()
  const setCancellation = useSetAtom(setOrderCancellationAtom)

  return useCallback(
    async ({ uid, chainId, cowShedTwap }: OpenOrder, type: CancellationType) => {
      setCancellation(uid, { status: 'signing', type })

      try {
        const txHash = cowShedTwap
          ? await cancelCowShedTwap({ config, chainId, twap: cowShedTwap })
          : await cancelOrder({ config, chainId, orderUid: uid, type })

        if (txHash) {
          if (!isHash(txHash)) throw new Error(`Unexpected transaction hash: ${txHash}`)

          setCancellation(uid, { status: 'pending', type: 'hard', txHash })

          let replacement: ReplacementReason | undefined

          const receipt = await waitForTransactionReceipt(config, {
            chainId,
            hash: txHash,
            onReplaced: ({ reason, transaction }) => {
              replacement = reason

              if (reason === 'repriced') {
                setCancellation(uid, { status: 'pending', type: 'hard', txHash: transaction.hash })
              }
            },
          })

          if (replacement === 'cancelled') {
            setCancellation(uid, null)
            trackEvent('order_cancel', { chainId, cancellationType: 'hard', result: 'rejected' })

            return
          }

          if (replacement === 'replaced') throw new Error('The cancellation transaction was replaced')
          if (receipt.status === 'reverted') throw new Error('The cancellation transaction reverted')
        }

        setCancellation(uid, { status: 'cancelled', type })
        trackEvent('order_cancel', { chainId, cancellationType: type, result: 'cancelled' })
        await queryClient.invalidateQueries({ queryKey: [RWA_QUERY_KEY_ROOT, 'open-orders'] })
      } catch (err: unknown) {
        const error = normalizeError(err)

        const isRejected = isUserRejection(error)

        setCancellation(uid, isRejected ? null : { status: 'failed', type, error: getErrorMessage(error) })
        trackEvent('order_cancel', { chainId, cancellationType: type, result: isRejected ? 'rejected' : 'failed' })
      }
    },
    [config, queryClient, setCancellation],
  )
}

export function useOrderCancellation(uid: string): OrderCancellation | undefined {
  return useAtomValue(orderCancellationsAtom)[uid]
}

function getErrorMessage(error: Error): string {
  return error instanceof BaseError ? error.shortMessage : error.message
}

function isUserRejection(error: Error & { code?: number }): boolean {
  if (error instanceof BaseError) return !!error.walk((cause) => cause instanceof UserRejectedRequestError)

  return error.code === USER_REJECTED_CODE
}
