import { TokenWithLogo } from '@cowprotocol/common-const'
import { formatTokenAmount } from '@cowprotocol/common-utils'
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

export function extractTokenMeta(order: Partial<EnrichedOrder> | undefined): {
  inputToken?: TokenInfo
  outputToken?: TokenInfo
} {
  const { inputToken, outputToken } = (order as unknown as { inputToken?: TokenInfo; outputToken?: TokenInfo }) || {}
  return { inputToken, outputToken }
}

export function buildBaseFields(payload: BaseOrderPayload): AnalyticsPayload {
  return {
    walletAddress: safeGetString(payload.order, 'owner'),
    orderId: safeGetString(payload.order, 'uid'),
    chainId: payload.chainId.toString(),
  }
}

export function buildTokenFields(
  payload: BaseOrderPayload,
  meta: { inputToken?: TokenInfo; outputToken?: TokenInfo },
): AnalyticsPayload {
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
    sellAmountUnits: atomsToUnits(sellAmountAtoms, meta.inputToken, sellTokenDecimals),
    buyAmountUnits: atomsToUnits(buyAmountAtoms, meta.outputToken, buyTokenDecimals),
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
    sellAmountUnits: atomsToUnits(p.inputAmount, p.inputToken),
    buyAmountUnits: atomsToUnits(p.outputAmount, p.outputToken),
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

  const sellDecimals = inputToken?.decimals
  const buyDecimals = outputToken?.decimals
  const hasBridgeOrder = Boolean(p.bridgeOrder ?? (p.order as { bridgeOrder?: unknown } | undefined)?.bridgeOrder)

  return {
    ...base,
    // Atoms
    executedSellAmount: executedSellAmountAtoms,
    executedBuyAmount: executedBuyAmountAtoms,
    executedFeeAmount: executedFeeAmountAtoms,

    // Units (decimals-adjusted)
    executedSellAmountUnits: atomsToUnits(executedSellAmountAtoms, inputToken, sellDecimals),
    executedBuyAmountUnits: atomsToUnits(executedBuyAmountAtoms, outputToken, buyDecimals),
    executedFeeAmountUnits: atomsToUnits(executedFeeAmountAtoms, inputToken, sellDecimals),

    // Safary-lexicon style fields (explicit for fulfillment amounts)
    from_amount: atomsToUnits(executedSellAmountAtoms, inputToken, sellDecimals),
    to_amount: atomsToUnits(executedBuyAmountAtoms, outputToken, buyDecimals),

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

// Format atom values for analytics (Safary expects decimals-adjusted strings, no locale prettifying)
function atomsToUnits(
  value: string | number | bigint | null | undefined,
  token?: TokenInfo,
  decimalsOverride?: number,
): string | undefined {
  const amount = toCurrencyAmount(value, token, decimalsOverride)
  if (!amount) return undefined

  const formatted = formatTokenAmount(amount)
  return formatted || undefined
}

function toCurrencyAmount(
  value: string | number | bigint | null | undefined,
  token?: TokenInfo,
  decimalsOverride?: number,
): CurrencyAmount<TokenWithLogo> | null {
  const raw = normalizeValue(value)
  const currency = toTokenCurrency(token, decimalsOverride)
  if (!raw || !currency) return null

  try {
    return CurrencyAmount.fromRawAmount(currency, raw)
  } catch {
    return null
  }
}

function normalizeValue(value: string | number | bigint | null | undefined): string | null {
  if (value === undefined || value === null) return null
  return typeof value === 'bigint' ? value.toString() : String(value)
}

function toTokenCurrency(token?: TokenInfo, decimalsOverride?: number): TokenWithLogo | null {
  if (!token?.address) return null

  const decimals = decimalsOverride ?? token.decimals
  if (!Number.isInteger(decimals) || decimals < 0) return null

  try {
    return TokenWithLogo.fromToken({
      ...token,
      chainId: token.chainId ?? 0,
      decimals,
      symbol: token.symbol || '',
      name: token.name || '',
    })
  } catch {
    return null
  }
}
