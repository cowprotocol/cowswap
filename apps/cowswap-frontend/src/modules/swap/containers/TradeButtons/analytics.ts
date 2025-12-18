import { getCurrencyAddress } from '@cowprotocol/common-utils'
import type { Currency, CurrencyAmount } from '@uniswap/sdk-core'

import { CowSwapAnalyticsCategory, toCowSwapGtmEvent } from 'common/analytics/types'
import type { CowSwapGtmEvent } from 'common/analytics/types'

const BRIDGE_ANALYTICS_EVENT = {
  category: CowSwapAnalyticsCategory.Bridge,
  action: 'swap_bridge_click',
} as const

interface SwapDerivedStateLike {
  chainId?: number
  inputCurrency: Currency | null
  outputCurrency: Currency | null
  inputCurrencyAmount: CurrencyAmount<Currency> | null
  outputCurrencyAmount: CurrencyAmount<Currency> | null
}

interface BuildEventParams extends SwapDerivedStateLike {
  isCurrentTradeBridging: boolean
  walletAddress?: string
  action?: string
}

function isBridgeEventBuildable(params: BuildEventParams): params is BuildEventParams & {
  inputCurrency: Currency
  outputCurrency: Currency
  inputCurrencyAmount: CurrencyAmount<Currency>
} {
  const { isCurrentTradeBridging, inputCurrency, outputCurrency, inputCurrencyAmount } = params
  return Boolean(isCurrentTradeBridging && inputCurrency && outputCurrency && inputCurrencyAmount)
}

function getChainIds(params: BuildEventParams & { inputCurrency: Currency | null; outputCurrency: Currency | null }): {
  sellTokenChainId?: number
  buyTokenChainId?: number
  toChainId?: number
} {
  const { isCurrentTradeBridging, inputCurrency, outputCurrency, chainId } = params
  const sellTokenChainId = inputCurrency?.chainId ?? chainId
  const destinationChainFallback = !isCurrentTradeBridging ? chainId : undefined
  const buyTokenChainId = outputCurrency?.chainId ?? destinationChainFallback
  const toChainId = outputCurrency?.chainId ?? destinationChainFallback
  return { sellTokenChainId, buyTokenChainId, toChainId }
}

function buildBridgeLabel(
  fromChainId: number | undefined,
  toChainId: number | undefined,
  inputSymbol: string | undefined,
  outputSymbol: string | undefined,
  amountHuman: string,
): string {
  return `From: ${fromChainId}, To: ${toChainId ?? 'unknown'}, TokenIn: ${inputSymbol || ''}, TokenOut: ${
    outputSymbol || ''
  }, Amount: ${amountHuman}`
}

function buildBuyFields(params: {
  outputCurrency: Currency | null
  outputCurrencyAmount: CurrencyAmount<Currency> | null
  buyTokenChainId?: number
  toChainId?: number
}): Record<string, unknown> {
  const { outputCurrency, outputCurrencyAmount, buyTokenChainId, toChainId } = params
  const extra: Record<string, unknown> = {}
  if (toChainId !== undefined) extra.toChainId = toChainId
  if (outputCurrency && outputCurrencyAmount) {
    extra.buyToken = getCurrencyAddress(outputCurrency)
    extra.buyTokenSymbol = outputCurrency.symbol || ''
    if (buyTokenChainId !== undefined) extra.buyTokenChainId = buyTokenChainId
    extra.buyAmountExpected = outputCurrencyAmount.quotient.toString()
    extra.buyAmountHuman = outputCurrencyAmount.toSignificant(6)
  }
  return extra
}

export function buildSwapBridgeClickEvent(params: BuildEventParams): string | undefined {
  if (!isBridgeEventBuildable(params)) return undefined

  const { inputCurrency, outputCurrency, inputCurrencyAmount, outputCurrencyAmount, walletAddress, action } = params
  const { sellTokenChainId, buyTokenChainId, toChainId } = getChainIds(params)
  const eventAction = action ?? BRIDGE_ANALYTICS_EVENT.action

  const baseEvent: Omit<CowSwapGtmEvent, 'category'> & { category: CowSwapAnalyticsCategory } = {
    ...BRIDGE_ANALYTICS_EVENT,
    action: eventAction,
    label: buildBridgeLabel(
      sellTokenChainId,
      toChainId,
      inputCurrency.symbol,
      outputCurrency?.symbol,
      inputCurrencyAmount.toSignificant(6),
    ),
    fromChainId: sellTokenChainId,
    walletAddress,
    sellToken: getCurrencyAddress(inputCurrency),
    sellTokenSymbol: inputCurrency.symbol || '',
    sellTokenChainId: sellTokenChainId,
    sellAmount: inputCurrencyAmount.quotient.toString(),
    sellAmountHuman: inputCurrencyAmount.toSignificant(6),
    value: Number(inputCurrencyAmount.toSignificant(6)),
  }

  const extra = buildBuyFields({
    outputCurrency,
    outputCurrencyAmount,
    buyTokenChainId,
    toChainId,
  })

  return toCowSwapGtmEvent({
    ...baseEvent,
    ...extra,
  })
}

export type { BuildEventParams as TradeButtonsAnalyticsParams }
