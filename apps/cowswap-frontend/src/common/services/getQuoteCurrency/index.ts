import { STABLECOINS } from '@cowprotocol/common-const'
import { getCurrencyAddress } from '@cowprotocol/common-utils'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

import { Nullish } from 'types'

/**
 * Quote - means the currency we consider as base (https://www.investopedia.com/terms/q/quotecurrency.asp#:~:text=What%20Is%20a%20Quote%20Currency,value%20of%20the%20base%20currency)
 * For example: 400 UNI -> 2000 USDC - UNI is the quote currency, because is a stable coin against a non-stable coin
 *
 * The algorithm:
 * 1. If one of the tokens is stable-coin, then take the opposite token as quote
 * 2. Otherwise, take the token with the smallest amount as quote (for 0.0005 WETH -> 3000 COW, WETH is quote)
 */
export function getQuoteCurrency(
  chainId: SupportedChainId | undefined,
  inputCurrencyAmount: Nullish<CurrencyAmount<Currency>>,
  outputCurrencyAmount: Nullish<CurrencyAmount<Currency>>,
): Currency | null {
  if (!chainId || !inputCurrencyAmount || !outputCurrencyAmount) return null

  const inputCurrency = inputCurrencyAmount.currency
  const outputCurrency = outputCurrencyAmount.currency

  const quoteCurrencyByStableCoin = getQuoteCurrencyByStableCoin(chainId, inputCurrency, outputCurrency)

  if (quoteCurrencyByStableCoin) return quoteCurrencyByStableCoin

  return inputCurrencyAmount.lessThan(outputCurrencyAmount) ? inputCurrency : outputCurrency
}

export function getQuoteCurrencyByStableCoin(
  chainId: SupportedChainId | undefined,
  inputCurrency: Currency | null,
  outputCurrency: Currency | null,
): Currency | null {
  if (!chainId || !inputCurrency || !outputCurrency) return null

  const stableCoins = STABLECOINS[chainId]

  const inputAddress = getCurrencyAddress(inputCurrency).toLowerCase()
  const outputAddress = getCurrencyAddress(outputCurrency).toLowerCase()

  const isInputStableCoin = stableCoins.has(inputAddress)
  const isOutputStableCoin = stableCoins.has(outputAddress)

  if (isInputStableCoin) return outputCurrency
  if (isOutputStableCoin) return inputCurrency

  return null
}
