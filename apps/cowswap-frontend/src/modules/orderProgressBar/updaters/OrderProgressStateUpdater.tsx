import { useAtomValue, useStore } from 'jotai'
import { MutableRefObject, ReactNode, useEffect, useMemo, useRef } from 'react'

import { OrderClass, SupportedChainId } from '@cowprotocol/cow-sdk'
import { useWalletInfo } from '@cowprotocol/wallet'

import { useSurplusQueueOrderIds } from 'entities/surplusModal'

import { Order } from 'legacy/state/orders/actions'
import { useOnlyPendingOrders } from 'legacy/state/orders/hooks'

import { type OrderFillability, usePendingOrdersFillability } from 'modules/ordersTable'
import { useTradeConfirmState } from 'modules/trade'

import { useOrderProgressBarPropsWithFillability } from '../hooks/useOrderProgressBarProps'
import {
  cancellationTrackedOrderIdsAtom,
  ordersProgressBarStateAtom,
  pruneOrdersProgressBarState,
} from '../state/atoms'

const UNTRACKED_ORDER_STATE_GRACE_PERIOD_MS = 10_000

type OrderProgressStatePrunerProps = {
  account: string | undefined
  chainId: number | undefined
  marketOrders: Order[]
  surplusQueueOrderIds: string[]
  transactionHash: string | null
}

type TrackedOrderIdsParams = OrderProgressStatePrunerProps & {
  cancellationTrackedOrderIds: string[]
}

function getTrackedOrderIdsWithGracePeriod(
  trackedOrderIds: Set<string>,
  ordersProgressState: Record<string, unknown>,
  recentlyUntrackedOrderIdsRef: MutableRefObject<Record<string, number>>,
  now = Date.now(),
): string[] {
  const recentlyUntrackedOrderIds = recentlyUntrackedOrderIdsRef.current

  Object.keys(ordersProgressState).forEach((orderId) => {
    if (trackedOrderIds.has(orderId)) {
      delete recentlyUntrackedOrderIds[orderId]
      return
    }

    recentlyUntrackedOrderIds[orderId] ??= now + UNTRACKED_ORDER_STATE_GRACE_PERIOD_MS
  })

  Object.entries(recentlyUntrackedOrderIds).forEach(([orderId, expiresAt]) => {
    if (expiresAt > now && ordersProgressState[orderId]) {
      trackedOrderIds.add(orderId)
      return
    }

    delete recentlyUntrackedOrderIds[orderId]
  })

  return Array.from(trackedOrderIds)
}

function getNextGracePeriodDelayMs(
  recentlyUntrackedOrderIdsRef: MutableRefObject<Record<string, number>>,
  now = Date.now(),
): number | undefined {
  const futureExpiryTimes = Object.values(recentlyUntrackedOrderIdsRef.current).filter((expiresAt) => expiresAt > now)

  if (!futureExpiryTimes.length) {
    return undefined
  }

  return Math.max(Math.min(...futureExpiryTimes) - now, 0)
}

function getTrackedOrderIds({
  account,
  cancellationTrackedOrderIds,
  chainId,
  marketOrders,
  surplusQueueOrderIds,
  transactionHash,
}: TrackedOrderIdsParams): Set<string> {
  const trackedIdsSet = new Set<string>()

  // Surplus and confirmation modals can stay mounted while the wallet reconnects or is disconnected,
  // so we still prune based on their IDs even when `account`/`chainId` are temporarily unavailable.
  if (account && chainId) {
    marketOrders.forEach((order) => trackedIdsSet.add(order.id))
  }

  surplusQueueOrderIds.forEach((orderId) => trackedIdsSet.add(orderId))

  if (transactionHash) {
    trackedIdsSet.add(transactionHash)
  }

  cancellationTrackedOrderIds.forEach((orderId) => trackedIdsSet.add(orderId))

  return trackedIdsSet
}

function OrderProgressStateObserver({
  chainId,
  currentOrderFillability,
  order,
}: {
  chainId: SupportedChainId
  currentOrderFillability: OrderFillability | undefined
  order: Order
}): null {
  useOrderProgressBarPropsWithFillability(chainId, order, currentOrderFillability)
  return null
}

function OrderProgressStatePruner({
  account,
  chainId,
  marketOrders,
  surplusQueueOrderIds,
  transactionHash,
}: OrderProgressStatePrunerProps): null {
  const store = useStore()
  // Keep the progress-state subscriptions inside the pruner so countdown/step ticks do not
  // rerender every order observer. The parent only owns the observer list.
  const cancellationTrackedOrderIds = useAtomValue(cancellationTrackedOrderIdsAtom)
  const recentlyUntrackedOrderIdsRef = useRef<Record<string, number>>({})
  const pruneTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const isPruningRef = useRef(false)

  useEffect(() => {
    function clearPruneTimer(): void {
      if (pruneTimerRef.current == null) {
        return
      }

      clearTimeout(pruneTimerRef.current)
      pruneTimerRef.current = undefined
    }

    function runPruneCycle(): void {
      if (isPruningRef.current) {
        return
      }

      isPruningRef.current = true

      try {
        const trackedOrderIds = getTrackedOrderIdsWithGracePeriod(
          getTrackedOrderIds({
            account,
            cancellationTrackedOrderIds,
            chainId,
            marketOrders,
            surplusQueueOrderIds,
            transactionHash,
          }),
          store.get(ordersProgressBarStateAtom),
          recentlyUntrackedOrderIdsRef,
        )

        store.set(pruneOrdersProgressBarState, trackedOrderIds)

        clearPruneTimer()

        const nextGracePeriodDelayMs = getNextGracePeriodDelayMs(recentlyUntrackedOrderIdsRef)

        if (nextGracePeriodDelayMs == null) {
          return
        }

        // Re-run when the next retained stale entry expires, even if nothing else rerenders.
        pruneTimerRef.current = setTimeout(runPruneCycle, nextGracePeriodDelayMs)
      } finally {
        isPruningRef.current = false
      }
    }

    const unsubscribe = store.sub(ordersProgressBarStateAtom, runPruneCycle)
    runPruneCycle()

    return () => {
      unsubscribe()
      clearPruneTimer()
    }
  }, [account, cancellationTrackedOrderIds, chainId, marketOrders, store, surplusQueueOrderIds, transactionHash])

  return null
}

function OrderProgressStateObservers({
  chainId,
  marketOrders,
  pendingOrdersFillability,
}: {
  chainId: SupportedChainId
  marketOrders: Order[]
  pendingOrdersFillability: Record<string, OrderFillability | undefined>
}): ReactNode {
  return (
    <>
      {marketOrders.map((order) => (
        <OrderProgressStateObserver
          key={order.id}
          chainId={chainId}
          currentOrderFillability={pendingOrdersFillability[order.id]}
          order={order}
        />
      ))}
    </>
  )
}

export function OrderProgressStateUpdater(): ReactNode {
  const { chainId, account } = useWalletInfo()
  const { transactionHash } = useTradeConfirmState()
  const surplusQueueOrderIds = useSurplusQueueOrderIds()

  const pendingOrders = useOnlyPendingOrders(chainId as SupportedChainId, account)
  const marketOrders = useMemo(
    () => pendingOrders.filter((order) => order.class === OrderClass.MARKET),
    [pendingOrders],
  )
  const pendingOrdersFillability = usePendingOrdersFillability(OrderClass.MARKET)

  if (!chainId || !account) {
    return (
      <OrderProgressStatePruner
        account={account}
        chainId={chainId}
        marketOrders={marketOrders}
        surplusQueueOrderIds={surplusQueueOrderIds}
        transactionHash={transactionHash}
      />
    )
  }

  return (
    <>
      <OrderProgressStatePruner
        account={account}
        chainId={chainId}
        marketOrders={marketOrders}
        surplusQueueOrderIds={surplusQueueOrderIds}
        transactionHash={transactionHash}
      />
      <OrderProgressStateObservers
        chainId={chainId as SupportedChainId}
        marketOrders={marketOrders}
        pendingOrdersFillability={pendingOrdersFillability}
      />
    </>
  )
}
