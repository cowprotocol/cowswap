import { useAtomValue, useSetAtom } from 'jotai'
import { useCallback, useMemo } from 'react'

import { useWalletInfo } from '@cowprotocol/wallet'

import { twapOrdersAtom, twapOrdersListAtom, useTwapOrdersTokens } from 'entities/twap'

import {
  dismissTwapPrototypeCancellationNoticeAtom,
  dismissTwapPrototypeRecoverNoticeAtom,
  queueTwapPrototypeRecoverNoticeAtom,
  twapPrototypeCancellationNoticeAtom,
  twapPrototypeRecoverNoticeAtom,
} from '../state/twapPrototypeProxyUiAtom'
import { TwapOrderItem } from '../types'
import {
  buildPrototypeProxyState,
  PrototypeProxyCurrentTokenSummary,
  getPrototypeProxyAddress,
  PrototypeProxyDerivedState,
  PrototypeProxyOrderEntry,
  PrototypeProxyTokenSummary,
} from '../utils/buildPrototypeProxyState'
import { isCurrentPrototypeOrder } from '../utils/prototypeOrderState'

interface UseTwapPrototypeProxy {
  isEnabled: boolean
  proxyAddress: string | null
  currentTokens: PrototypeProxyCurrentTokenSummary[]
  activeTokens: PrototypeProxyTokenSummary[]
  claimableTokens: PrototypeProxyTokenSummary[]
  withdrawnTokens: PrototypeProxyTokenSummary[]
  activeOrders: PrototypeProxyOrderEntry[]
  claimableOrders: PrototypeProxyOrderEntry[]
  withdrawnOrders: PrototypeProxyOrderEntry[]
  withdrawnActiveOrders: PrototypeProxyOrderEntry[]
  noticeOrderIds: string[]
  recoverNoticeActiveOrderCount: number
  hasAnyProxyFunds: boolean
  hasActiveFunds: boolean
  hasClaimableFunds: boolean
  hasWithdrawnFunds: boolean
  hasWithdrawnActiveFunds: boolean
  dismissCancellationNotice(): void
  dismissRecoverNotice(): void
  queueRecoverNotice(activeOrderCount: number): void
  withdrawToken(tokenAddress: string): void
  withdrawClaimableToken(tokenAddress: string): void
  withdrawAllClaimableFunds(): void
  withdrawAllFunds(): void
  resetWithdrawnFunds(): void
  getOrderFundsState(orderId: string): PrototypeProxyOrderEntry['state'] | null
}

export function useTwapPrototypeProxy(): UseTwapPrototypeProxy {
  const { account, chainId } = useWalletInfo()
  const allTwapOrders = useAtomValue(twapOrdersListAtom)
  const tokensByAddress = useTwapOrdersTokens()
  const setTwapOrders = useSetAtom(twapOrdersAtom)
  const prototypeNotices = useTwapPrototypeNotices()
  const accountLowerCase = account?.toLowerCase()
  const { activeOrders, claimableOrders, proxyAddress, proxyState, withdrawnActiveOrders, withdrawnOrders } =
    usePrototypeProxyDerivedData({
      accountLowerCase,
      allTwapOrders,
      chainId,
      tokensByAddress,
    })
  const withdrawActions = usePrototypeWithdrawActions({
    activeOrders,
    accountLowerCase,
    chainId,
    claimableOrders,
    setTwapOrders,
  })
  const getOrderFundsState = useCallback(
    (orderId: string) => proxyState.orders.find((order) => order.order.id === orderId)?.state || null,
    [proxyState.orders],
  )
  return {
    isEnabled: !!accountLowerCase && !!chainId,
    proxyAddress,
    currentTokens: proxyState.currentTokens,
    activeTokens: proxyState.activeTokens,
    claimableTokens: proxyState.claimableTokens,
    withdrawnTokens: proxyState.withdrawnTokens,
    activeOrders,
    claimableOrders,
    withdrawnOrders,
    withdrawnActiveOrders,
    noticeOrderIds: prototypeNotices.noticeOrderIds,
    recoverNoticeActiveOrderCount: prototypeNotices.recoverNoticeActiveOrderCount,
    hasAnyProxyFunds: proxyState.orders.length > 0,
    hasActiveFunds: proxyState.activeTokens.length > 0,
    hasClaimableFunds: proxyState.claimableTokens.length > 0,
    hasWithdrawnFunds: proxyState.withdrawnTokens.length > 0,
    hasWithdrawnActiveFunds: withdrawnActiveOrders.length > 0,
    dismissCancellationNotice: prototypeNotices.dismissCancellationNotice,
    dismissRecoverNotice: prototypeNotices.dismissRecoverNotice,
    queueRecoverNotice: prototypeNotices.queueRecoverNotice,
    ...withdrawActions,
    getOrderFundsState,
  }
}

function filterCurrentPrototypeOrders(
  allTwapOrders: TwapOrderItem[],
  accountLowerCase: string | undefined,
  chainId: number | undefined,
): TwapOrderItem[] {
  if (!accountLowerCase || !chainId) {
    return []
  }

  return allTwapOrders.filter((order) => isCurrentPrototypeOrder(order, chainId, accountLowerCase))
}

function getOrdersByState(
  orders: PrototypeProxyOrderEntry[],
  state: PrototypeProxyOrderEntry['state'],
): PrototypeProxyOrderEntry[] {
  return orders.filter((order) => order.state === state)
}

function getOrdersByStates(
  orders: PrototypeProxyOrderEntry[],
  states: PrototypeProxyOrderEntry['state'][],
): PrototypeProxyOrderEntry[] {
  return orders.filter((order) => states.includes(order.state))
}

function markPrototypeOrdersAsWithdrawn({
  currentOrders,
  accountLowerCase,
  chainId,
  entries,
  now,
  tokenAddress,
}: {
  currentOrders: Record<string, TwapOrderItem>
  accountLowerCase: string | undefined
  chainId: number | undefined
  entries: PrototypeProxyOrderEntry[]
  now: string
  tokenAddress?: string
}): Record<string, TwapOrderItem> {
  let hasChanges = false

  const nextOrders = Object.fromEntries(
    Object.entries(currentOrders).map(([orderId, order]) => {
      if (!accountLowerCase || !chainId || !isCurrentPrototypeOrder(order, chainId, accountLowerCase)) {
        return [orderId, order]
      }

      const entry = entries.find((item) => {
        if (item.order.id !== orderId) {
          return false
        }

        return !tokenAddress || item.order.order.sellToken.toLowerCase() === tokenAddress.toLowerCase()
      })

      if (!entry || order.prototypeProxyFundsClaimedAt) {
        return [orderId, order]
      }

      hasChanges = true

      return [orderId, { ...order, prototypeProxyFundsClaimedAt: now }]
    }),
  )

  return hasChanges ? nextOrders : currentOrders
}

function resetClaimedPrototypeOrders(
  currentOrders: Record<string, TwapOrderItem>,
  accountLowerCase: string | undefined,
  chainId: number | undefined,
): Record<string, TwapOrderItem> {
  let hasChanges = false

  const nextOrders = Object.fromEntries(
    Object.entries(currentOrders).map(([orderId, order]) => {
      if (
        !accountLowerCase ||
        !chainId ||
        !isCurrentPrototypeOrder(order, chainId, accountLowerCase) ||
        !order.prototypeProxyFundsClaimedAt
      ) {
        return [orderId, order]
      }

      hasChanges = true

      return [orderId, { ...order, prototypeProxyFundsClaimedAt: undefined }]
    }),
  )

  return hasChanges ? nextOrders : currentOrders
}

function usePrototypeProxyDerivedData({
  accountLowerCase,
  allTwapOrders,
  chainId,
  tokensByAddress,
}: {
  accountLowerCase: string | undefined
  allTwapOrders: TwapOrderItem[]
  chainId: number | undefined
  tokensByAddress: ReturnType<typeof useTwapOrdersTokens>
}): {
  activeOrders: PrototypeProxyOrderEntry[]
  claimableOrders: PrototypeProxyOrderEntry[]
  proxyAddress: string | null
  proxyState: PrototypeProxyDerivedState
  withdrawnActiveOrders: PrototypeProxyOrderEntry[]
  withdrawnOrders: PrototypeProxyOrderEntry[]
} {
  const prototypeOrders = useMemo(
    () => filterCurrentPrototypeOrders(allTwapOrders, accountLowerCase, chainId),
    [accountLowerCase, allTwapOrders, chainId],
  )
  const proxyState = useMemo<PrototypeProxyDerivedState>(
    () => buildPrototypeProxyState(prototypeOrders, tokensByAddress),
    [prototypeOrders, tokensByAddress],
  )
  const proxyAddress = useMemo(
    () => (accountLowerCase && chainId ? getPrototypeProxyAddress(accountLowerCase, chainId) : null),
    [accountLowerCase, chainId],
  )

  return useMemo(
    () => ({
      activeOrders: getOrdersByState(proxyState.orders, 'active'),
      claimableOrders: getOrdersByState(proxyState.orders, 'claimable'),
      proxyAddress,
      proxyState,
      withdrawnActiveOrders: getOrdersByState(proxyState.orders, 'withdrawn'),
      withdrawnOrders: getOrdersByStates(proxyState.orders, ['claimed', 'withdrawn']),
    }),
    [proxyAddress, proxyState],
  )
}

function usePrototypeWithdrawActions({
  activeOrders,
  accountLowerCase,
  chainId,
  claimableOrders,
  setTwapOrders,
}: {
  activeOrders: PrototypeProxyOrderEntry[]
  accountLowerCase: string | undefined
  chainId: number | undefined
  claimableOrders: PrototypeProxyOrderEntry[]
  setTwapOrders: (update: (currentOrders: Record<string, TwapOrderItem>) => Record<string, TwapOrderItem>) => void
}): Pick<
  UseTwapPrototypeProxy,
  'withdrawToken' | 'withdrawClaimableToken' | 'withdrawAllClaimableFunds' | 'withdrawAllFunds' | 'resetWithdrawnFunds'
> {
  const markOrdersAsWithdrawn = useCallback(
    (entries: PrototypeProxyOrderEntry[], tokenAddress?: string) => {
      setTwapOrders((currentOrders) =>
        markPrototypeOrdersAsWithdrawn({
          currentOrders,
          accountLowerCase,
          chainId,
          entries,
          now: new Date().toISOString(),
          tokenAddress,
        }),
      )
    },
    [accountLowerCase, chainId, setTwapOrders],
  )
  const withdrawClaimableToken = useCallback(
    (tokenAddress: string) => markOrdersAsWithdrawn(claimableOrders, tokenAddress),
    [claimableOrders, markOrdersAsWithdrawn],
  )
  const withdrawToken = useCallback(
    (tokenAddress: string) => markOrdersAsWithdrawn([...claimableOrders, ...activeOrders], tokenAddress),
    [activeOrders, claimableOrders, markOrdersAsWithdrawn],
  )
  const withdrawAllClaimableFunds = useCallback(
    () => markOrdersAsWithdrawn(claimableOrders),
    [claimableOrders, markOrdersAsWithdrawn],
  )
  const withdrawAllFunds = useCallback(
    () => markOrdersAsWithdrawn([...claimableOrders, ...activeOrders]),
    [activeOrders, claimableOrders, markOrdersAsWithdrawn],
  )
  const resetWithdrawnFunds = useCallback(
    () => setTwapOrders((currentOrders) => resetClaimedPrototypeOrders(currentOrders, accountLowerCase, chainId)),
    [accountLowerCase, chainId, setTwapOrders],
  )

  return {
    withdrawToken,
    withdrawClaimableToken,
    withdrawAllClaimableFunds,
    withdrawAllFunds,
    resetWithdrawnFunds,
  }
}

function useTwapPrototypeNotices(): Pick<
  UseTwapPrototypeProxy,
  | 'noticeOrderIds'
  | 'recoverNoticeActiveOrderCount'
  | 'dismissCancellationNotice'
  | 'dismissRecoverNotice'
  | 'queueRecoverNotice'
> {
  const cancellationNoticeState = useAtomValue(twapPrototypeCancellationNoticeAtom)
  const recoverNoticeState = useAtomValue(twapPrototypeRecoverNoticeAtom)
  const dismissCancellationNotice = useSetAtom(dismissTwapPrototypeCancellationNoticeAtom)
  const dismissRecoverNotice = useSetAtom(dismissTwapPrototypeRecoverNoticeAtom)
  const queueRecoverNotice = useSetAtom(queueTwapPrototypeRecoverNoticeAtom)

  return {
    noticeOrderIds: cancellationNoticeState.orderIds,
    recoverNoticeActiveOrderCount: recoverNoticeState.activeOrderCount,
    dismissCancellationNotice,
    dismissRecoverNotice,
    queueRecoverNotice,
  }
}
