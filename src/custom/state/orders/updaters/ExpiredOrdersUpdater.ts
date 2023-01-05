import { supportedChainId } from 'utils/supportedChainId'
import { useExpiredOrders, useSetIsOrderRefundedBatch } from 'state/orders/hooks'
import { SupportedChainId as ChainId } from 'constants/chains'
import { EXPIRED_ORDERS_PENDING_TIME } from 'constants/index'
import { EXPIRED_ORDERS_CHECK_POLL_INTERVAL } from 'state/orders/consts'
import { useWeb3React } from '@web3-react/core'
import { useEffect, useCallback, useRef } from 'react'
import { getOrder } from '@cow/api/gnosisProtocol'
import { SetIsOrderRefundedBatch } from 'state/orders/actions'

export function ExpiredOrdersUpdater(): null {
  const { chainId: _chainId, account } = useWeb3React()
  const chainId = supportedChainId(_chainId)

  const expired = useExpiredOrders({ chainId })

  // Ref, so we don't rerun useEffect
  const expiredRef = useRef(expired)
  const isUpdating = useRef(false) // TODO: Implement using SWR or retry/cancellable promises
  expiredRef.current = expired

  const setIsOrderRefundedBatch = useSetIsOrderRefundedBatch()

  const updateOrders = useCallback(
    async (chainId: ChainId, account: string) => {
      const lowerCaseAccount = account.toLowerCase()
      const now = Date.now()

      if (isUpdating.current) {
        return
      }

      try {
        isUpdating.current = true

        // Filter orders:
        // - Owned by the current connected account
        // - Created in the last 5 min, no further
        // - Not yet refunded
        const pending = expiredRef.current.filter(({ owner, creationTime: creationTimeString, refundHash }) => {
          const creationTime = new Date(creationTimeString).getTime()

          return (
            owner.toLowerCase() === lowerCaseAccount && now - creationTime < EXPIRED_ORDERS_PENDING_TIME && !refundHash
          )
        })

        if (pending.length === 0) {
          // console.debug(`[CancelledOrdersUpdater] No orders are being expired`)
          return
        } else {
          console.debug(`[ExpiredOrdersUpdater] Checking ${pending.length} recently expired orders...`)
        }

        const ordersPromises = pending.map(({ id }) => getOrder(chainId, id))

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
