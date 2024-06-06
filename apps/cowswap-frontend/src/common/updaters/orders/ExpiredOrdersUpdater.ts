import { useEffect, useCallback, useRef } from 'react'

import { NATIVE_CURRENCY_ADDRESS } from '@cowprotocol/common-const'
import { SupportedChainId as ChainId } from '@cowprotocol/cow-sdk'
import { useWalletInfo } from '@cowprotocol/wallet'

import { SetIsOrderRefundedBatch } from 'legacy/state/orders/actions'
import { EXPIRED_ORDERS_CHECK_POLL_INTERVAL } from 'legacy/state/orders/consts'
import { useExpiredOrders, useSetIsOrderRefundedBatch } from 'legacy/state/orders/hooks'

import { getOrder } from 'api/cowProtocol'

export function ExpiredOrdersUpdater(): null {
  const { chainId, account } = useWalletInfo()
  const expired = useExpiredOrders({ chainId })

  // Ref, so we don't rerun useEffect
  const expiredRef = useRef(expired)
  const isUpdating = useRef(false) // TODO: Implement using SWR or retry/cancellable promises
  expiredRef.current = expired

  const setIsOrderRefundedBatch = useSetIsOrderRefundedBatch()

  const updateOrders = useCallback(
    async (chainId: ChainId, account: string) => {
      const lowerCaseAccount = account.toLowerCase()

      if (isUpdating.current) {
        return
      }

      try {
        isUpdating.current = true

        // Filter expired orders:
        // - Only eth-flow orders
        // - Owned by the current connected account
        // - Not yet refunded
        const orderWithoutRefund = expiredRef.current.filter(({ owner, refundHash, sellToken }) => {
          const isEthFlowOrder = sellToken === NATIVE_CURRENCY_ADDRESS

          return isEthFlowOrder && owner.toLowerCase() === lowerCaseAccount && !refundHash
        })

        if (orderWithoutRefund.length === 0) {
          return
        } else {
          console.debug(`[ExpiredOrdersUpdater] Checking ${orderWithoutRefund.length} recently expired orders...`)
        }

        const ordersPromises = orderWithoutRefund.map(({ id }) => getOrder(chainId, id))

        const resolvedPromises = await Promise.allSettled(ordersPromises)

        const items: SetIsOrderRefundedBatch['items'] = []

        resolvedPromises.forEach((promise) => {
          if (promise.status === 'fulfilled' && promise.value?.ethflowData?.refundTxHash) {
            items.push({ id: promise.value.uid, refundHash: promise.value?.ethflowData?.refundTxHash })
          }
        })

        items.length && setIsOrderRefundedBatch({ chainId, items })

        console.debug(`[ExpiredOrdersUpdater] ${items.length} orders have been refunded`, items)
      } finally {
        isUpdating.current = false
      }
    },
    [setIsOrderRefundedBatch]
  )

  useEffect(() => {
    if (!chainId || !account) {
      return
    }

    const interval = setInterval(() => updateOrders(chainId, account), EXPIRED_ORDERS_CHECK_POLL_INTERVAL)

    return () => clearInterval(interval)
  }, [account, chainId, updateOrders])

  return null
}
