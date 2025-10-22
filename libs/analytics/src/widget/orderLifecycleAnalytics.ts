import { TokenWithLogo } from '@cowprotocol/common-const'
import { formatTokenAmount } from '@cowprotocol/common-utils'
import type { EnrichedOrder, TokenInfo } from '@cowprotocol/cow-sdk'
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
import { CurrencyAmount } from '@uniswap/sdk-core'

import { getCowAnalytics } from '../utils'

// Specialized helper function for string properties to ensure we always return a string
export const safeGetString = <T, K extends keyof T>(obj: T | undefined, key: K, fallback: string = ''): string => {
  const value = obj && obj[key] != null ? obj[key] : fallback
  return String(value)
}

export type AnalyticsPayload = Record<string, unknown>

type EnrichedOrderWithTokens = EnrichedOrder & {
  inputToken?: TokenInfo
  outputToken?: TokenInfo
}

export function extractTokenMeta(order: Partial<EnrichedOrderWithTokens> | undefined): {
  inputToken?: TokenInfo
  outputToken?: TokenInfo
} {
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

type Tokenish = {
  address?: string
  chainId?: number
  decimals?: number
  logoURI?: string
  name?: string
  symbol?: string
}

const isValidDecimals = (decimals: number | undefined): decimals is number =>
  typeof decimals === 'number' && Number.isInteger(decimals) && decimals >= 0

const toTokenWithLogo = (meta?: Tokenish): TokenWithLogo | null => {
  if (!meta?.address || !isValidDecimals(meta.decimals)) {
    return null
  }

  try {
    return TokenWithLogo.fromToken(
      {
        chainId: meta.chainId ?? 0,
        address: meta.address,
        decimals: meta.decimals,
        symbol: meta.symbol || '',
        name: meta.name || '',
      },
      meta.logoURI,
    )
  } catch {
    return null
  }
}

type RawAmount = string | number | bigint | null | undefined

const normalizeRawAmount = (rawAmount: RawAmount): string | undefined => {
  if (rawAmount === null || rawAmount === undefined) {
    return undefined
  }

  const raw = typeof rawAmount === 'bigint' ? rawAmount.toString() : String(rawAmount)
  const trimmed = raw.trim()

  return trimmed === '' ? undefined : trimmed
}

const formatTokenUnits = (meta: Tokenish | undefined, rawAmount: RawAmount): string | undefined => {
  const normalizedRaw = normalizeRawAmount(rawAmount)
  if (!normalizedRaw) {
    return undefined
  }

  const currency = toTokenWithLogo(meta)
  if (!currency) {
    return undefined
  }

  try {
    const amount = CurrencyAmount.fromRawAmount(currency, normalizedRaw)
    const formatted = formatTokenAmount(amount)
    return formatted || undefined
  } catch {
    return undefined
  }
}

const buildTokenFields = (
  payload: BaseOrderPayload,
  meta: { inputToken?: TokenInfo; outputToken?: TokenInfo },
): AnalyticsPayload => {
  const sellTokenAddress = safeGetString(payload.order, 'sellToken')
  const buyTokenAddress = safeGetString(payload.order, 'buyToken')

  const sellAmountAtoms = safeGetString(payload.order, 'sellAmount')
  const buyAmountAtoms = safeGetString(payload.order, 'buyAmount')

  const sellTokenDecimals: number | undefined = meta.inputToken?.decimals
  const buyTokenDecimals: number | undefined = meta.outputToken?.decimals

  return {
    sellToken: sellTokenAddress,
    buyToken: buyTokenAddress,
    sellAmount: sellAmountAtoms,
    buyAmount: buyAmountAtoms,
    sellTokenSymbol: meta.inputToken?.symbol || '',
    buyTokenSymbol: meta.outputToken?.symbol || '',
    sellTokenDecimals,
    buyTokenDecimals,
    sellAmountUnits: formatTokenUnits(meta.inputToken, sellAmountAtoms),
    buyAmountUnits: formatTokenUnits(meta.outputToken, buyAmountAtoms),
  }
}

// Build generic analytics-friendly alias fields for currency/amounts.
// The current keys align with Safary's lexicon, but the helper name is
// provider-agnostic so we can evolve the mapping without touching call sites.
export function buildAnalyticsCurrencyAliases(fields: AnalyticsPayload): AnalyticsPayload {
  const sellTokenAddress = String(fields.sellToken || '')
  const buyTokenAddress = String(fields.buyToken || '')

  const sellAmountUnits = typeof fields.sellAmountUnits === 'string' ? fields.sellAmountUnits : undefined
  const buyAmountUnits = typeof fields.buyAmountUnits === 'string' ? fields.buyAmountUnits : undefined
  const sellAmountRaw = normalizeRawAmount(fields.sellAmount as RawAmount)
  const buyAmountRaw = normalizeRawAmount(fields.buyAmount as RawAmount)

  return {
    from_currency_address: sellTokenAddress,
    to_currency_address: buyTokenAddress,
    from_currency: String(fields.sellTokenSymbol || ''),
    to_currency: String(fields.buyTokenSymbol || ''),
    from_amount: sellAmountUnits ?? sellAmountRaw,
    to_amount: buyAmountUnits ?? buyAmountRaw,
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
    sellAmount: p.inputAmount.toString(),
    buyAmount: p.outputAmount.toString(),
    sellTokenSymbol: safeGetString(p.inputToken, 'symbol'),
    buyTokenSymbol: safeGetString(p.outputToken, 'symbol'),
    sellTokenDecimals: p.inputToken?.decimals,
    buyTokenDecimals: p.outputToken?.decimals,
    sellAmountUnits: formatTokenUnits(p.inputToken, p.inputAmount),
    buyAmountUnits: formatTokenUnits(p.outputToken, p.outputAmount),
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

  const executedSellAmountUnits = formatTokenUnits(inputToken, executedSellAmountAtoms)
  const executedBuyAmountUnits = formatTokenUnits(outputToken, executedBuyAmountAtoms)
  const executedFeeAmountUnits = formatTokenUnits(inputToken, executedFeeAmountAtoms)
  const executedSellAmountRaw = normalizeRawAmount(executedSellAmountAtoms)
  const executedBuyAmountRaw = normalizeRawAmount(executedBuyAmountAtoms)

  return {
    ...base,
    // Atoms
    executedSellAmount: executedSellAmountAtoms,
    executedBuyAmount: executedBuyAmountAtoms,
    executedFeeAmount: executedFeeAmountAtoms,

    // Units (decimals-adjusted)
    executedSellAmountUnits,
    executedBuyAmountUnits,
    executedFeeAmountUnits,

    // Safary-lexicon style fields (explicit for fulfillment amounts)
    from_amount: executedSellAmountUnits ?? executedSellAmountRaw,
    to_amount: executedBuyAmountUnits ?? executedBuyAmountRaw,

    // Note: bridge providers tag actual widget orders via isBridgeOrder; this flag only captures the token selection being cross-chain.
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
      return
    }

    analytics.sendEvent(analyticsEvent, mapper(payload))
  }
}

// Sets up event handlers for order lifecycle events.
export const setupEventHandlers = (
  eventEmitter: SimpleCowEventEmitter<CowWidgetEventPayloadMap, CowWidgetEvents>,
): void => {
  // Register each event handler
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
