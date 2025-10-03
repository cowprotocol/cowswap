import { TokenWithLogo } from '@cowprotocol/common-const'
import { formatTokenAmount } from '@cowprotocol/common-utils'
import type { EnrichedOrder } from '@cowprotocol/cow-sdk'
import {
  CowWidgetEvents,
  SimpleCowEventEmitter,
  CowWidgetEventPayloadMap,
  CowEventHandler,
  OnPostedOrderPayload,
  OnFulfilledOrderPayload,
  OnCancelledOrderPayload,
  OnExpiredOrderPayload,
  BaseOrderPayload,
} from '@cowprotocol/events'
import type { TokenInfo } from '@cowprotocol/types'
import { CurrencyAmount } from '@uniswap/sdk-core'

import { getCowAnalytics } from '../utils'

export const safeGetString = <T, K extends keyof T>(obj: T | undefined, key: K, fallback: string = ''): string => {
  const value = obj && obj[key] != null ? obj[key] : fallback
  return String(value)
}

export type AnalyticsPayload = Record<string, unknown>

type EnrichedOrderWithTokens = EnrichedOrder & {
  inputToken?: TokenInfo
  outputToken?: TokenInfo
}

type TokenMetadata = TokenInfo | OnPostedOrderPayload['inputToken'] | OnPostedOrderPayload['outputToken']

type OrderTokens = {
  inputToken?: TokenInfo
  outputToken?: TokenInfo
}

export function extractTokenMeta(order: Partial<EnrichedOrderWithTokens> | undefined): OrderTokens {
  if (!order) {
    return {}
  }

  return {
    inputToken: order.inputToken?.address ? order.inputToken : undefined,
    outputToken: order.outputToken?.address ? order.outputToken : undefined,
  }
}

export function buildBaseFields(payload: BaseOrderPayload): AnalyticsPayload {
  return {
    walletAddress: safeGetString(payload.order, 'owner'),
    orderId: safeGetString(payload.order, 'uid'),
    chainId: payload.chainId.toString(),
  }
}

const createCurrency = (meta?: TokenMetadata): TokenWithLogo | null => {
  if (!meta?.address) {
    return null
  }

  const decimals = meta.decimals
  if (typeof decimals !== 'number' || !Number.isInteger(decimals) || decimals < 0) {
    return null
  }

  try {
    return TokenWithLogo.fromToken({
      ...meta,
      chainId: meta.chainId ?? 0,
      decimals,
      symbol: meta.symbol || '',
      name: meta.name || '',
    })
  } catch {
    return null
  }
}

const toFormattedAmount = (
  meta: TokenMetadata | undefined,
  rawAmount: string | number | bigint | null | undefined,
): string | undefined => {
  if (rawAmount === null || rawAmount === undefined) {
    return undefined
  }

  const currency = createCurrency(meta)
  if (!currency) {
    return undefined
  }

  try {
    const raw = typeof rawAmount === 'bigint' ? rawAmount.toString() : String(rawAmount)
    const amount = CurrencyAmount.fromRawAmount(currency, raw)
    const formatted = formatTokenAmount(amount)
    return formatted || undefined
  } catch {
    return undefined
  }
}

const buildTokenFields = (payload: BaseOrderPayload, meta: OrderTokens): AnalyticsPayload => {
  const sellTokenAddress = safeGetString(payload.order, 'sellToken')
  const buyTokenAddress = safeGetString(payload.order, 'buyToken')

  const sellAmountAtoms = safeGetString(payload.order, 'sellAmount')
  const buyAmountAtoms = safeGetString(payload.order, 'buyAmount')

  const sellAmountUnits = toFormattedAmount(meta.inputToken, sellAmountAtoms)
  const buyAmountUnits = toFormattedAmount(meta.outputToken, buyAmountAtoms)

  return {
    sellToken: sellTokenAddress,
    buyToken: buyTokenAddress,
    sellAmount: sellAmountAtoms,
    buyAmount: buyAmountAtoms,
    sellTokenSymbol: meta.inputToken?.symbol || '',
    buyTokenSymbol: meta.outputToken?.symbol || '',
    sellTokenDecimals: meta.inputToken?.decimals,
    buyTokenDecimals: meta.outputToken?.decimals,
    sellAmountUnits,
    buyAmountUnits,
  }
}

export function buildAnalyticsCurrencyAliases(fields: AnalyticsPayload): AnalyticsPayload {
  const sellTokenAddress = String(fields.sellToken || '')
  const buyTokenAddress = String(fields.buyToken || '')

  const sellAmountUnits = typeof fields.sellAmountUnits === 'string' ? fields.sellAmountUnits : undefined
  const buyAmountUnits = typeof fields.buyAmountUnits === 'string' ? fields.buyAmountUnits : undefined

  return {
    from_currency_address: sellTokenAddress,
    to_currency_address: buyTokenAddress,
    from_currency: String(fields.sellTokenSymbol || ''),
    to_currency: String(fields.buyTokenSymbol || ''),
    from_amount: sellAmountUnits,
    to_amount: buyAmountUnits,
  }
}

export function getOrderPayload(payload: BaseOrderPayload): AnalyticsPayload {
  const meta = extractTokenMeta(payload.order)
  const base = buildBaseFields(payload)
  const tokenFields = buildTokenFields(payload, meta)
  const aliases = buildAnalyticsCurrencyAliases(tokenFields)

  return { ...base, ...tokenFields, ...aliases }
}

const mapCancelledOrder = (p: OnCancelledOrderPayload): AnalyticsPayload => ({
  ...getOrderPayload(p),
  reason: 'cancelled',
  transactionHash: p.transactionHash || '',
})

const mapExpiredOrder = (p: OnExpiredOrderPayload): AnalyticsPayload => ({
  ...getOrderPayload(p),
  reason: 'expired',
})

export function mapPostedOrder(p: OnPostedOrderPayload): AnalyticsPayload {
  const tokenFields: AnalyticsPayload = {
    sellToken: safeGetString(p.inputToken, 'address'),
    buyToken: safeGetString(p.outputToken, 'address'),
    sellAmount: p.inputAmount.toString() || '',
    buyAmount: p.outputAmount.toString() || '',
    sellTokenSymbol: safeGetString(p.inputToken, 'symbol'),
    buyTokenSymbol: safeGetString(p.outputToken, 'symbol'),
    sellTokenDecimals: p.inputToken?.decimals,
    buyTokenDecimals: p.outputToken?.decimals,
    sellAmountUnits: toFormattedAmount(p.inputToken, p.inputAmount),
    buyAmountUnits: toFormattedAmount(p.outputToken, p.outputAmount),
  }

  return {
    walletAddress: p.owner || '',
    orderId: p.orderUid,
    chainId: p.chainId.toString(),
    ...tokenFields,
    ...buildAnalyticsCurrencyAliases(tokenFields),
    orderType: p.orderType,
    partiallyFillable: p.partiallyFillable,
    isEthFlow: Boolean(p.isEthFlow),
    kind: p.kind,
    receiver: p.receiver || '',
    orderCreationHash: p.orderCreationHash || '',
  }
}

export function mapFulfilledOrder(p: OnFulfilledOrderPayload): AnalyticsPayload {
  const base = getOrderPayload(p)

  const executedSellAmountAtoms = safeGetString(p.order, 'executedSellAmount')
  const executedBuyAmountAtoms = safeGetString(p.order, 'executedBuyAmount')
  const executedFeeAmountAtoms = safeGetString(p.order, 'executedFeeAmount')

  const { inputToken, outputToken } = extractTokenMeta(p.order)

  const hasBridgeOrder = Boolean(p.bridgeOrder ?? (p.order as { bridgeOrder?: unknown } | undefined)?.bridgeOrder)

  const executedSellAmountUnits = toFormattedAmount(inputToken, executedSellAmountAtoms)
  const executedBuyAmountUnits = toFormattedAmount(outputToken, executedBuyAmountAtoms)
  const executedFeeAmountUnits = toFormattedAmount(inputToken, executedFeeAmountAtoms)

  return {
    ...base,
    executedSellAmount: executedSellAmountAtoms,
    executedBuyAmount: executedBuyAmountAtoms,
    executedFeeAmount: executedFeeAmountAtoms,
    executedSellAmountUnits,
    executedBuyAmountUnits,
    executedFeeAmountUnits,
    from_amount: executedSellAmountUnits,
    to_amount: executedBuyAmountUnits,
    isCrossChain: hasBridgeOrder,
  }
}

const createAnalyticsHandler = <K extends CowWidgetEvents>(
  analyticsEvent: string,
  mapper: (payload: CowWidgetEventPayloadMap[K]) => AnalyticsPayload,
): CowEventHandler<CowWidgetEventPayloadMap, K> => {
  return (payload: CowWidgetEventPayloadMap[K]): void => {
    const analytics = getCowAnalytics()

    if (!analytics) {
      console.warn('Analytics instance not available for event:', analyticsEvent)
      return
    }

    analytics.sendEvent(analyticsEvent, mapper(payload))
  }
}

export const setupEventHandlers = (
  eventEmitter: SimpleCowEventEmitter<CowWidgetEventPayloadMap, CowWidgetEvents>,
): void => {
  eventEmitter.on({
    event: CowWidgetEvents.ON_POSTED_ORDER,
    handler: createAnalyticsHandler<CowWidgetEvents.ON_POSTED_ORDER>('order_submitted', mapPostedOrder),
  })

  eventEmitter.on({
    event: CowWidgetEvents.ON_FULFILLED_ORDER,
    handler: createAnalyticsHandler<CowWidgetEvents.ON_FULFILLED_ORDER>('swap_executed', mapFulfilledOrder),
  })

  eventEmitter.on({
    event: CowWidgetEvents.ON_CANCELLED_ORDER,
    handler: createAnalyticsHandler<CowWidgetEvents.ON_CANCELLED_ORDER>('swap_cancelled', mapCancelledOrder),
  })

  eventEmitter.on({
    event: CowWidgetEvents.ON_EXPIRED_ORDER,
    handler: createAnalyticsHandler<CowWidgetEvents.ON_EXPIRED_ORDER>('swap_expired', mapExpiredOrder),
  })
}
