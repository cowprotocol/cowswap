import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { Currency, CurrencyAmount } from '@uniswap/sdk-core'
import { DAI, USDC_MAINNET, USDT } from 'constants/tokens'
import { DAI_GOERLI, USDT_GOERLI, USDC_GOERLI } from 'utils/goerli/constants'
import { USDC_GNOSIS_CHAIN, USDT_GNOSIS_CHAIN, WXDAI } from 'utils/gnosis_chain/constants'
import { NATIVE_CURRENCY_BUY_ADDRESS } from 'constants/index'
import { isSupportedChain } from 'utils/supportedChainId'

// TODO: Find a solution for using API: https://www.coingecko.com/en/categories/stablecoins
const STABLE_COINS: { [key in SupportedChainId]: string[] } = {
  [SupportedChainId.MAINNET]: [USDC_MAINNET, USDT, DAI].map((token) => token.address.toLowerCase()),
  [SupportedChainId.GNOSIS_CHAIN]: [USDC_GNOSIS_CHAIN, USDT_GNOSIS_CHAIN, WXDAI]
    .map((token) => token.address.toLowerCase())
    // XDAI and WXDAI are stable-coins
    .concat(NATIVE_CURRENCY_BUY_ADDRESS),
  [SupportedChainId.GOERLI]: [USDC_GOERLI, USDT_GOERLI, DAI_GOERLI].map((token) => token.address.toLowerCase()),
}

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
  inputCurrencyAmount: CurrencyAmount<Currency> | null,
  outputCurrencyAmount: CurrencyAmount<Currency> | null
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
  outputCurrency: Currency | null
): Currency | null {
  if (!chainId || !isSupportedChain(chainId) || !inputCurrency || !outputCurrency) return null

  const stableCoins = STABLE_COINS[chainId]

  const inputAddress = inputCurrency.isNative ? NATIVE_CURRENCY_BUY_ADDRESS : inputCurrency.address.toLowerCase()
  const outputAddress = outputCurrency.isNative ? NATIVE_CURRENCY_BUY_ADDRESS : outputCurrency.address.toLowerCase()

  const isInputStableCoin = stableCoins.includes(inputAddress)
  const isOutputStableCoin = stableCoins.includes(outputAddress)

  if (isInputStableCoin) return outputCurrency
  if (isOutputStableCoin) return inputCurrency

  return null
}
