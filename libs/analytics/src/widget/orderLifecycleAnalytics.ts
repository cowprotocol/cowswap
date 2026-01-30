import { TokenWithLogo } from '@cowprotocol/common-const'
import { FractionUtils } from '@cowprotocol/common-utils'
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
export function safeGetString<T, K extends keyof T>(obj: T | undefined, key: K, fallback: string = ''): string {
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
  const inputToken = order?.inputToken
  const outputToken = order?.outputToken

  return {
    inputToken: inputToken?.address ? inputToken : undefined,
    outputToken: outputToken?.address ? outputToken : undefined,
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

function isValidDecimals(decimals: number | undefined): decimals is number {
  return typeof decimals === 'number' && Number.isInteger(decimals) && decimals >= 0
}

function toTokenWithLogo(meta?: Tokenish): TokenWithLogo | null {
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

function normalizeRawAmount(rawAmount: RawAmount): string | undefined {
  if (rawAmount === null || rawAmount === undefined) {
    return undefined
  }

  const raw = typeof rawAmount === 'bigint' ? rawAmount.toString() : String(rawAmount)
  const trimmed = raw.trim()

  return trimmed === '' ? undefined : trimmed
}

function formatTokenUnitsExact(meta: Tokenish | undefined, rawAmount: RawAmount): string | undefined {
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
    // Use exact units for Safary; formatTokenAmount can add locale/suffix output.
    const exact = FractionUtils.fractionLikeToExactString(amount)
    return exact || undefined
  } catch {
    return undefined
  }
}

function buildTokenFields(
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
    sellAmountUnits: formatTokenUnitsExact(meta.inputToken, sellAmountAtoms),
    buyAmountUnits: formatTokenUnitsExact(meta.outputToken, buyAmountAtoms),
  }
}

// Build analytics-friendly alias fields for currency/amounts.
// These keys align with Safary's camelCase lexicon.
export function buildAnalyticsCurrencyAliases(fields: AnalyticsPayload): AnalyticsPayload {
  const sellTokenAddress = String(fields.sellToken || '')
  const buyTokenAddress = String(fields.buyToken || '')
  const sellTokenSymbol = typeof fields.sellTokenSymbol === 'string' ? fields.sellTokenSymbol.trim() : ''
  const buyTokenSymbol = typeof fields.buyTokenSymbol === 'string' ? fields.buyTokenSymbol.trim() : ''

  const sellAmountUnits = typeof fields.sellAmountUnits === 'string' ? fields.sellAmountUnits : undefined
  const buyAmountUnits = typeof fields.buyAmountUnits === 'string' ? fields.buyAmountUnits : undefined

  return {
    fromCurrencyAddress: sellTokenAddress,
    toCurrencyAddress: buyTokenAddress,
    // Fall back to token addresses when symbols are missing.
    fromCurrency: sellTokenSymbol || sellTokenAddress,
    toCurrency: buyTokenSymbol || buyTokenAddress,
    fromAmount: sellAmountUnits,
    toAmount: buyAmountUnits,
  }
}

export function getOrderPayload(payload: BaseOrderPayload): AnalyticsPayload {
  const meta = extractTokenMeta(payload.order)
  const base = buildBaseFields(payload)
  const tokenFields = buildTokenFields(payload, meta)
  const aliases = buildAnalyticsCurrencyAliases(tokenFields)

  return { ...base, ...tokenFields, ...aliases }
}

export function mapCancelledOrder(p: OnCancelledOrderPayload): AnalyticsPayload {
  return {
    ...getOrderPayload(p),
    reason: 'cancelled',
    transactionHash: p.transactionHash || '',
  }
}

export function mapExpiredOrder(p: OnExpiredOrderPayload): AnalyticsPayload {
  return {
    ...getOrderPayload(p),
    reason: 'expired',
  }
}

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
    sellAmountUnits: formatTokenUnitsExact(p.inputToken, p.inputAmount),
    buyAmountUnits: formatTokenUnitsExact(p.outputToken, p.outputAmount),
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

  const hasBridgeOrder = Boolean(p.bridgeOrder)

  const executedSellAmountUnits = formatTokenUnitsExact(inputToken, executedSellAmountAtoms)
  const executedBuyAmountUnits = formatTokenUnitsExact(outputToken, executedBuyAmountAtoms)
  const executedFeeAmountUnits = formatTokenUnitsExact(inputToken, executedFeeAmountAtoms)

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
    fromAmount: executedSellAmountUnits,
    toAmount: executedBuyAmountUnits,

    // Note: bridge providers tag actual widget orders via bridgeOrder; this flag (isCrossChain) only captures the token selection being cross-chain.
    isCrossChain: hasBridgeOrder,
  }
}

function createAnalyticsHandler<K extends CowWidgetEvents>(
  analyticsEvent: string,
  mapper: (payload: CowWidgetEventPayloadMap[K]) => AnalyticsPayload,
): CowEventHandler<CowWidgetEventPayloadMap, K> {
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
