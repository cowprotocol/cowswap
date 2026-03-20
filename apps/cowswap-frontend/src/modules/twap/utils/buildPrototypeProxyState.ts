import { TokenWithLogo } from '@cowprotocol/common-const'
import { getAddressKey } from '@cowprotocol/cow-sdk'
import { CurrencyAmount } from '@cowprotocol/currency'
import { TokensByAddress } from '@cowprotocol/tokens'
import { getAddress } from '@ethersproject/address'
import { id } from '@ethersproject/hash'

import { resolveDisplayTwapOrder } from './resolveDisplayTwapOrder'

import { TwapOrderItem, TwapOrderStatus } from '../types'

export interface PrototypeProxyCurrentTokenSummary extends PrototypeProxyTokenSummary {
  activeOrderIds: string[]
  claimableOrderIds: string[]
}

export interface PrototypeProxyDerivedState {
  orders: PrototypeProxyOrderEntry[]
  currentTokens: PrototypeProxyCurrentTokenSummary[]
  activeTokens: PrototypeProxyTokenSummary[]
  claimableTokens: PrototypeProxyTokenSummary[]
  withdrawnTokens: PrototypeProxyTokenSummary[]
}

export interface PrototypeProxyOrderEntry {
  order: TwapOrderItem
  token: TokenWithLogo
  remainingAmount: CurrencyAmount<TokenWithLogo>
  state: PrototypeProxyOrderFundsState
}

export type PrototypeProxyOrderFundsState = 'active' | 'claimable' | 'claimed' | 'withdrawn' | 'none'

export interface PrototypeProxyTokenSummary {
  token: TokenWithLogo
  amount: CurrencyAmount<TokenWithLogo>
  orderIds: string[]
}

export function buildPrototypeProxyState(
  orders: TwapOrderItem[],
  tokensByAddress: TokensByAddress | undefined,
): PrototypeProxyDerivedState {
  if (!tokensByAddress) {
    return { orders: [], currentTokens: [], activeTokens: [], claimableTokens: [], withdrawnTokens: [] }
  }

  const orderEntries = orders.reduce<PrototypeProxyOrderEntry[]>((acc, order) => {
    const resolvedOrder = resolveDisplayTwapOrder(order)
    const token = tokensByAddress[getAddressKey(resolvedOrder.order.sellToken)]

    if (!token) {
      return acc
    }

    const remainingAmount = getRemainingSellAmount(resolvedOrder, token)
    const state = getPrototypeProxyOrderFundsState(resolvedOrder, BigInt(remainingAmount.quotient.toString()))

    if (state === 'none') {
      return acc
    }

    acc.push({
      order: resolvedOrder,
      token,
      remainingAmount,
      state,
    })

    return acc
  }, [])

  return {
    orders: orderEntries,
    currentTokens: buildCurrentTokenSummaries(orderEntries),
    activeTokens: buildTokenSummaries(orderEntries, 'active'),
    claimableTokens: buildTokenSummaries(orderEntries, 'claimable'),
    withdrawnTokens: buildTokenSummaries(orderEntries, ['claimed', 'withdrawn']),
  }
}

export function getPrototypeProxyAddress(account: string, chainId: number): string {
  const hash = id(`twap-prototype-proxy:${chainId}:${account.toLowerCase()}`)

  return getAddress(`0x${hash.slice(-40)}`)
}

export function getPrototypeProxyOrderFundsState(
  order: TwapOrderItem,
  remainingAmount: bigint,
): PrototypeProxyOrderFundsState {
  if (!order.isPrototype || remainingAmount === 0n) {
    return 'none'
  }

  if (order.prototypeProxyFundsClaimedAt) {
    return isPrototypeActiveStatus(order.status) ? 'withdrawn' : 'claimed'
  }

  if (isPrototypeActiveStatus(order.status)) {
    return 'active'
  }

  if (order.status === TwapOrderStatus.Expired) {
    return 'claimable'
  }

  return isPrototypeClaimableCancelledOrder(order) ? 'claimable' : 'none'
}

export function getRemainingSellAmount(order: TwapOrderItem, token: TokenWithLogo): CurrencyAmount<TokenWithLogo> {
  return CurrencyAmount.fromRawAmount(token, getRemainingSellAmountRaw(order).toString())
}

export function getRemainingSellAmountRaw(order: TwapOrderItem): bigint {
  const totalSellAmount = BigInt(order.order.partSellAmount) * BigInt(order.order.n)
  const executedSellAmount = BigInt(order.executionInfo.info.executedSellAmount)

  return totalSellAmount > executedSellAmount ? totalSellAmount - executedSellAmount : 0n
}

function buildCurrentTokenSummaries(orders: PrototypeProxyOrderEntry[]): PrototypeProxyCurrentTokenSummary[] {
  const currentOrders = orders.filter((order) => order.state === 'active' || order.state === 'claimable')
  const tokenMap = new Map<string, PrototypeProxyCurrentTokenSummary>()

  currentOrders.forEach(({ token, remainingAmount, order, state }) => {
    const key = token.address.toLowerCase()
    const existingEntry = tokenMap.get(key)

    if (existingEntry) {
      tokenMap.set(key, {
        ...existingEntry,
        amount: existingEntry.amount.add(remainingAmount),
        orderIds: existingEntry.orderIds.concat(order.id),
        activeOrderIds:
          state === 'active' ? existingEntry.activeOrderIds.concat(order.id) : existingEntry.activeOrderIds,
        claimableOrderIds:
          state === 'claimable' ? existingEntry.claimableOrderIds.concat(order.id) : existingEntry.claimableOrderIds,
      })
      return
    }

    tokenMap.set(key, {
      token,
      amount: remainingAmount,
      orderIds: [order.id],
      activeOrderIds: state === 'active' ? [order.id] : [],
      claimableOrderIds: state === 'claimable' ? [order.id] : [],
    })
  })

  return Array.from(tokenMap.values()).sort((a, b) => {
    if (a.amount.equalTo(b.amount)) {
      return (a.token.symbol || a.token.address).localeCompare(b.token.symbol || b.token.address)
    }

    return a.amount.greaterThan(b.amount) ? -1 : 1
  })
}

function buildTokenSummaries(
  orders: PrototypeProxyOrderEntry[],
  state: PrototypeProxyOrderFundsState | PrototypeProxyOrderFundsState[],
): PrototypeProxyTokenSummary[] {
  const states = Array.isArray(state) ? state : [state]
  const entries = orders.filter((order) => states.includes(order.state))
  const tokenMap = new Map<string, PrototypeProxyTokenSummary>()

  entries.forEach(({ token, remainingAmount, order }) => {
    const key = token.address.toLowerCase()
    const existingEntry = tokenMap.get(key)

    if (existingEntry) {
      tokenMap.set(key, {
        ...existingEntry,
        amount: existingEntry.amount.add(remainingAmount),
        orderIds: existingEntry.orderIds.concat(order.id),
      })
      return
    }

    tokenMap.set(key, {
      token,
      amount: remainingAmount,
      orderIds: [order.id],
    })
  })

  return Array.from(tokenMap.values()).sort((a, b) => {
    if (a.amount.equalTo(b.amount)) {
      return (a.token.symbol || a.token.address).localeCompare(b.token.symbol || b.token.address)
    }

    return a.amount.greaterThan(b.amount) ? -1 : 1
  })
}

function isPrototypeActiveStatus(status: TwapOrderStatus): boolean {
  return status === TwapOrderStatus.Pending || status === TwapOrderStatus.Cancelling
}

function isPrototypeClaimableCancelledOrder(order: TwapOrderItem): boolean {
  return order.status === TwapOrderStatus.Cancelled && BigInt(order.executionInfo.info.executedSellAmount) > 0n
}
