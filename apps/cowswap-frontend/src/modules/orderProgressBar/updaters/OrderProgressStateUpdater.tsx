import { useAtomValue, useSetAtom } from 'jotai'
import { ReactNode, useEffect, useMemo } from 'react'

import { OrderClass, SupportedChainId } from '@cowprotocol/cow-sdk'
import { useWalletInfo } from '@cowprotocol/wallet'

import { useSurplusQueueOrderIds } from 'entities/surplusModal'

import { Order } from 'legacy/state/orders/actions'
import { useOnlyPendingOrders } from 'legacy/state/orders/hooks'

import { useTradeConfirmState } from 'modules/trade'

import { useOrderProgressBarProps } from '../hooks/useOrderProgressBarProps'
import { ordersProgressBarStateAtom, pruneOrdersProgressBarState } from '../state/atoms'

function OrderProgressStateObserver({ chainId, order }: { chainId: SupportedChainId; order: Order }): null {
  useOrderProgressBarProps(chainId, order)
  return null
}

export function OrderProgressStateUpdater(): ReactNode {
  const { chainId, account } = useWalletInfo()
  const pruneProgressState = useSetAtom(pruneOrdersProgressBarState)
  const { transactionHash } = useTradeConfirmState()
  const surplusQueueOrderIds = useSurplusQueueOrderIds()
  const progressState = useAtomValue(ordersProgressBarStateAtom)

  const pendingOrders = useOnlyPendingOrders(chainId as SupportedChainId, account)
  const marketOrders = useMemo(
    () => pendingOrders.filter((order) => order.class === OrderClass.MARKET),
    [pendingOrders],
  )

  useEffect(() => {
    const trackedIdsSet = new Set<string>()

    if (account && chainId) {
      marketOrders.forEach((order) => trackedIdsSet.add(order.id))
    }

    surplusQueueOrderIds.forEach((orderId) => trackedIdsSet.add(orderId))

    if (transactionHash) {
      trackedIdsSet.add(transactionHash)
    }

    Object.entries(progressState || {}).forEach(([orderId, state]) => {
      if (state?.cancellationTriggered) {
        trackedIdsSet.add(orderId)
      }
    })

    pruneProgressState(Array.from(trackedIdsSet))
  }, [account, chainId, marketOrders, progressState, pruneProgressState, surplusQueueOrderIds, transactionHash])

  if (!chainId || !account) {
    return null
  }

  return (
    <>
      {marketOrders.map((order) => (
        <OrderProgressStateObserver key={order.id} chainId={chainId as SupportedChainId} order={order} />
      ))}
    </>
  )
}
