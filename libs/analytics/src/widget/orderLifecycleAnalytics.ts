import { TokenWithLogo } from '@cowprotocol/common-const'
import type { EnrichedOrder } from '@cowprotocol/cow-sdk'
import {
  CowWidgetEvents,
  SimpleCowEventEmitter,
  CowWidgetEventPayloadMap,
  OnPostedOrderPayload,
  OnFulfilledOrderPayload,
  OnCancelledOrderPayload,
  OnExpiredOrderPayload,
  BaseOrderPayload,
} from '@cowprotocol/events'
import type { TokenInfo } from '@cowprotocol/types'
import { CurrencyAmount } from '@uniswap/sdk-core'

import { getCowAnalytics } from '../utils'

// Specialized helper function for string properties to ensure we always return a string
export const safeGetString = <T, K extends keyof T>(obj: T | undefined, key: K, fallback: string = ''): string => {
  const value = obj && obj[key] !== undefined ? obj[key] : fallback
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
    inputToken: order.inputToken,
    outputToken: order.outputToken,
  }
}

export function buildBaseFields(payload: BaseOrderPayload): AnalyticsPayload {
  return {
    walletAddress: safeGetString(payload.order, 'owner'),
    orderId: safeGetString(payload.order, 'uid'),
    chainId: payload.chainId.toString(),
  }
}

const createCurrency = (meta?: TokenInfo): TokenWithLogo | null => {
  if (!meta?.address) return null

  const decimals = meta.decimals
  if (typeof decimals !== 'number' || !Number.isInteger(decimals) || decimals < 0) return null

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

const toDecimalAmount = (
  meta: TokenInfo | undefined,
  rawAmount: string | number | bigint | null | undefined,
): string | undefined => {
  if (rawAmount === null || rawAmount === undefined) return undefined

  const currency = createCurrency(meta)
  if (!currency) return undefined

  try {
    const raw = typeof rawAmount === 'bigint' ? rawAmount.toString() : String(rawAmount)
    return CurrencyAmount.fromRawAmount(currency, raw).toExact() || undefined
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
    sellAmountUnits: toDecimalAmount(meta.inputToken, sellAmountAtoms),
    buyAmountUnits: toDecimalAmount(meta.outputToken, buyAmountAtoms),
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

const EVENT_CONFIGS = [
  // Handle order submission
  {
    event: CowWidgetEvents.ON_POSTED_ORDER,
    analyticsEvent: 'order_submitted',
    mapper: mapPostedOrder,
  },
  // Handle order fulfillment
  {
    event: CowWidgetEvents.ON_FULFILLED_ORDER,
    analyticsEvent: 'swap_executed',
    mapper: mapFulfilledOrder,
  },
  // Handle order cancellation
  {
    event: CowWidgetEvents.ON_CANCELLED_ORDER,
    analyticsEvent: 'swap_cancelled',
    mapper: (p: OnCancelledOrderPayload) => ({
      ...getOrderPayload(p),
      reason: 'cancelled',
      transactionHash: p.transactionHash || '',
    }),
  },
  // Handle order expiration
  {
    event: CowWidgetEvents.ON_EXPIRED_ORDER,
    analyticsEvent: 'swap_expired',
    mapper: (p: OnExpiredOrderPayload) => ({
      ...getOrderPayload(p),
      reason: 'expired',
    }),
  },
]

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
    sellAmountUnits: toDecimalAmount(p.inputToken, p.inputAmount),
    buyAmountUnits: toDecimalAmount(p.outputToken, p.outputAmount),
  }

  return {
    walletAddress: p.owner,
    orderId: p.orderUid,
    chainId: p.chainId.toString(),
    ...tokenFields,
    ...buildAnalyticsCurrencyAliases(tokenFields),
    orderType: p.orderType,
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

  const executedSellAmountUnits = toDecimalAmount(inputToken, executedSellAmountAtoms)
  const executedBuyAmountUnits = toDecimalAmount(outputToken, executedBuyAmountAtoms)
  const executedFeeAmountUnits = toDecimalAmount(inputToken, executedFeeAmountAtoms)

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
    from_amount: executedSellAmountUnits,
    to_amount: executedBuyAmountUnits,

    isCrossChain: hasBridgeOrder,
  }
}

// Sets up event handlers for order lifecycle events.
export const setupEventHandlers = (
  eventEmitter: SimpleCowEventEmitter<CowWidgetEventPayloadMap, CowWidgetEvents>,
): void => {
  // Register each event handler
  EVENT_CONFIGS.forEach((config) => {
    const { event, mapper, analyticsEvent } = config

    eventEmitter.on({
      event,

      handler: (payload: unknown): void => {
        const analytics = getCowAnalytics()

        if (!analytics) {
          console.warn('Analytics instance not available for event:', analyticsEvent)
          return
        }

        const normalizedMapper = mapper as (p: unknown) => AnalyticsPayload
        analytics.sendEvent(analyticsEvent, normalizedMapper(payload))
      },
    })
  })
}
