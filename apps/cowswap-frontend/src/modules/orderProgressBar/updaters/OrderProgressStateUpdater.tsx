import { useSetAtom } from 'jotai'
import { ReactNode, useEffect, useMemo } from 'react'

import { OrderClass, SupportedChainId } from '@cowprotocol/cow-sdk'
import { useWalletInfo } from '@cowprotocol/wallet'

import { Order } from 'legacy/state/orders/actions'
import { useOnlyPendingOrders } from 'legacy/state/orders/hooks'

import { useOrderProgressBarProps } from '../hooks/useOrderProgressBarProps'
import { pruneOrdersProgressBarState } from '../state/atoms'

function OrderProgressStateObserver({ chainId, order }: { chainId: SupportedChainId; order: Order }): null {
  useOrderProgressBarProps(chainId, order)
  return null
}

export function OrderProgressStateUpdater(): ReactNode {
  const { chainId, account } = useWalletInfo()
  const pruneProgressState = useSetAtom(pruneOrdersProgressBarState)

  const pendingOrders = useOnlyPendingOrders(chainId as SupportedChainId, account)
  const marketOrders = useMemo(
    () => pendingOrders.filter((order) => order.class === OrderClass.MARKET),
    [pendingOrders],
  )

  useEffect(() => {
    const trackedIds = account && chainId ? marketOrders.map((order) => order.id) : []
    pruneProgressState(trackedIds)
  }, [account, chainId, marketOrders, pruneProgressState])

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
