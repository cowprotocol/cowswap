import { NATIVE_CURRENCIES, WRAPPED_NATIVE_CURRENCIES } from '@cowprotocol/common-const'
import { isSellOrder } from '@cowprotocol/common-utils'
import { getAddressKey, SupportedChainId } from '@cowprotocol/cow-sdk'
import { Token } from '@cowprotocol/currency'

import { ParsedOrder } from 'utils/orderUtils/parseOrder'

import { buildCostLineItems, sumByToken } from './costLineItems.utils'
import { getPartnerFeePolicies } from './partnerFeePolicies.utils'
import { getProtocolFees } from './protocolFees.utils'
import { toSurplusTokenCosts } from './surplusTokenCosts.utils'

import { OrderCostsAndFees, OrderCostsAndFeesState, OrderTradesSnapshot } from '../types/orderCostsAndFees.types'

export interface OrderCostsAndFeesStateParams {
  order: ParsedOrder
  chainId: SupportedChainId
  snapshot: OrderTradesSnapshot | undefined
  error: unknown
  /** `undefined` while loading; `null` when not needed or unavailable. */
  nativePrice: number | null | undefined
}

const UNAVAILABLE: OrderCostsAndFeesState = { status: 'unavailable' }
const LOADING: OrderCostsAndFeesState = { status: 'loading' }

/** A snapshot of another order (kept while this order's trades load) is never shown. */
export function getOrderCostsAndFeesState({
  order,
  chainId,
  snapshot,
  error,
  nativePrice,
}: OrderCostsAndFeesStateParams): OrderCostsAndFeesState {
  if (!snapshot || snapshot.orderId !== order.id) return error ? UNAVAILABLE : LOADING
  if (snapshot.trades.length === 0) return UNAVAILABLE
  if (nativePrice === undefined) return LOADING

  return { status: 'ready', costs: buildCosts(order, chainId, snapshot, nativePrice) }
}

export function getSurplusToken(order: ParsedOrder): Token {
  return isSellOrder(order.kind) ? order.outputToken : order.inputToken
}

function buildCosts(
  order: ParsedOrder,
  chainId: SupportedChainId,
  snapshot: OrderTradesSnapshot,
  surplusNativePrice: number | null,
): OrderCostsAndFees {
  const nativeToken = NATIVE_CURRENCIES[chainId]
  const nativeKey = getAddressKey(nativeToken.address)
  const protocolFees = getProtocolFees(snapshot.trades, getPartnerFeePolicies(order.fullAppData))
  const lineItems = buildCostLineItems(protocolFees, snapshot.gasCost, nativeKey)

  const isSell = isSellOrder(order.kind)
  const surplusToken = getSurplusToken(order)
  const surplusCosts = toSurplusTokenCosts(lineItems, {
    surplusKey: getAddressKey(surplusToken.address),
    otherKey: getAddressKey((isSell ? order.inputToken : order.outputToken).address),
    nativeKey,
    wrappedNativeKey: getAddressKey(WRAPPED_NATIVE_CURRENCIES[chainId].address),
    isSell,
    executedSellAmount: snapshot.executedSellAmount,
    executedBuyAmount: snapshot.executedBuyAmount,
    surplusNativePrice,
  })

  return {
    lineItems,
    totals: sumByToken(lineItems),
    nativeToken,
    ...(surplusCosts && { surplusCosts: { ...surplusCosts, token: surplusToken } }),
  }
}
