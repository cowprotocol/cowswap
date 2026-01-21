import { useMemo } from 'react'

import { FractionUtils, getCurrencyAddress } from '@cowprotocol/common-utils'
import { useWalletInfo } from '@cowprotocol/wallet'
import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

import { useBridgeQuoteAmounts } from 'modules/bridge'
import { useEstimatedBridgeBuyAmount, useIsCurrentTradeBridging } from 'modules/trade'

import { CowSwapAnalyticsCategory, toCowSwapGtmEvent } from 'common/analytics/types'

export type SwapBridgeClickAction = 'swap_bridge_click' | 'swap_bridge_click_approve'

export interface SwapBridgeClickEventData {
  account?: string
  isBridging: boolean
  sellAmount?: CurrencyAmount<Currency> | null
  buyAmount?: CurrencyAmount<Currency> | null
}

export interface SwapBridgeClickEventInput extends SwapBridgeClickEventData {
  action: SwapBridgeClickAction
}

function getRawAmount(amount: CurrencyAmount<Currency> | null | undefined): string | undefined {
  return amount ? amount.quotient.toString() : undefined
}

function getExactAmount(amount: CurrencyAmount<Currency> | null | undefined): string | undefined {
  if (!amount) return undefined

  const exact = FractionUtils.fractionLikeToExactString(amount)
  return exact || undefined
}

function normalizeSymbol(currency: Currency): string {
  return currency.symbol ? currency.symbol.toLowerCase() : ''
}

function getTokenLabel(currency: Currency, address: string): string {
  const symbol = normalizeSymbol(currency)
  return symbol || address
}

function parseEventValue(value: string | undefined): number | undefined {
  if (!value) return undefined

  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : undefined
}

export function buildSwapBridgeClickEvent(input: SwapBridgeClickEventInput): string | undefined {
  const { action, account, isBridging, sellAmount, buyAmount } = input

  if (!isBridging || !sellAmount || !buyAmount) return undefined

  const sellCurrency = sellAmount.currency
  const buyCurrency = buyAmount.currency

  const sellTokenAddress = getCurrencyAddress(sellCurrency)
  const buyTokenAddress = getCurrencyAddress(buyCurrency)

  const sellAmountRaw = getRawAmount(sellAmount)
  const sellAmountHuman = getExactAmount(sellAmount)
  const buyAmountRaw = getRawAmount(buyAmount)
  const buyAmountHuman = getExactAmount(buyAmount)

  if (!sellAmountRaw || !sellAmountHuman || !buyAmountRaw || !buyAmountHuman) return undefined

  const label = `from: ${sellCurrency.chainId}, to: ${buyCurrency.chainId}, tokenin: ${getTokenLabel(
    sellCurrency,
    sellTokenAddress,
  )}, tokenout: ${getTokenLabel(buyCurrency, buyTokenAddress)}, amount: ${sellAmountHuman}`

  const value = parseEventValue(sellAmountHuman)

  return toCowSwapGtmEvent({
    category: CowSwapAnalyticsCategory.Bridge,
    action,
    label,
    ...(value !== undefined ? { value } : {}),
    walletAddress: account,
    fromChainId: sellCurrency.chainId,
    toChainId: buyCurrency.chainId,
    sellToken: sellTokenAddress,
    sellTokenSymbol: normalizeSymbol(sellCurrency),
    sellTokenDecimals: sellCurrency.decimals,
    sellTokenChainId: sellCurrency.chainId,
    sellAmount: sellAmountRaw,
    sellAmountHuman,
    buyToken: buyTokenAddress,
    buyTokenSymbol: normalizeSymbol(buyCurrency),
    buyTokenDecimals: buyCurrency.decimals,
    buyTokenChainId: buyCurrency.chainId,
    buyAmountExpected: buyAmountRaw,
    buyAmountHuman,
  })
}

export function useSwapBridgeClickEventData(): SwapBridgeClickEventData {
  const { account } = useWalletInfo()
  const isBridging = useIsCurrentTradeBridging()
  const bridgeQuoteAmounts = useBridgeQuoteAmounts()
  const estimatedBridgeAmounts = useEstimatedBridgeBuyAmount()

  const sellAmount = bridgeQuoteAmounts?.swapSellAmount ?? null
  const buyAmount = estimatedBridgeAmounts?.minToReceiveAmount ?? bridgeQuoteAmounts?.bridgeMinReceiveAmount ?? null

  return useMemo(
    () => ({
      account,
      isBridging,
      sellAmount,
      buyAmount,
    }),
    [account, isBridging, sellAmount, buyAmount],
  )
}
