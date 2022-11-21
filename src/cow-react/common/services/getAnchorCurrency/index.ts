import { SupportedChainId } from 'constants/chains'
import { Currency, CurrencyAmount, Token } from '@uniswap/sdk-core'
import { DAI, USDC_MAINNET, USDT, WBTC, WRAPPED_NATIVE_CURRENCY } from 'constants/tokens'
import { DAI_RINKEBY, USDT_RINKEBY, USDC_RINKEBY, WBTC_RINKEBY } from 'utils/rinkeby/constants'
import { DAI_GOERLI, USDT_GOERLI, USDC_GOERLI, WBTC_GOERLI } from 'utils/goerli/constants'
import { USDC_GNOSIS_CHAIN, USDT_GNOSIS_CHAIN, WBTC_GNOSIS_CHAIN, WXDAI } from 'utils/gnosis_chain/constants'
import { NATIVE_CURRENCY_BUY_ADDRESS } from 'constants/index'

const STABLE_COINS: { [key in SupportedChainId]: Token[] } = {
  [SupportedChainId.MAINNET]: [USDC_MAINNET, USDT, DAI],
  [SupportedChainId.GNOSIS_CHAIN]: [USDC_GNOSIS_CHAIN, USDT_GNOSIS_CHAIN, WXDAI],
  [SupportedChainId.GOERLI]: [USDC_GOERLI, USDT_GOERLI, DAI_GOERLI],
  [SupportedChainId.RINKEBY]: [USDC_RINKEBY, USDT_RINKEBY, DAI_RINKEBY],
}

const BTC_LIST: { [key in SupportedChainId]: Token } = {
  [SupportedChainId.MAINNET]: WBTC,
  [SupportedChainId.GNOSIS_CHAIN]: WBTC_GNOSIS_CHAIN,
  [SupportedChainId.GOERLI]: WBTC_GOERLI,
  [SupportedChainId.RINKEBY]: WBTC_RINKEBY,
}

/**
 * Anchor - means the currency we consider as base
 * For example: 1 COW -> 2000 USDC - COW is anchor, because in a trade with stable-coin we always use the opposite currency as base
 *
 * The algorithm:
 * 1. If one of the tokens is stable-coin, then take the opposite token as anchor
 * 2. If one of the tokens is BTC or wrapped native, then take it as anchor
 * 3. Take the token with the smallest amount as anchor (for 0.0005 WETH -> 3000 COW, WETH is anchor)
 */
export function getAnchorCurrency(
  chainId: SupportedChainId | undefined,
  inputCurrencyAmount: CurrencyAmount<Currency> | null,
  outputCurrencyAmount: CurrencyAmount<Currency> | null
): Currency | null {
  if (!chainId || !inputCurrencyAmount || !outputCurrencyAmount) return null

  const inputCurrency = inputCurrencyAmount.currency
  const outputCurrency = outputCurrencyAmount.currency
  const isInputAmountSmallerThatOutput = +inputCurrencyAmount.toExact() < +outputCurrencyAmount.toExact()

  const stableCoins = STABLE_COINS[chainId].map((token) => token.address.toLowerCase())
  const wrappedNativeToken = WRAPPED_NATIVE_CURRENCY[chainId]
  const btcToken = BTC_LIST[chainId]

  const inputAddress = inputCurrency.isNative ? NATIVE_CURRENCY_BUY_ADDRESS : inputCurrency.address.toLowerCase()
  const outputAddress = outputCurrency.isNative ? NATIVE_CURRENCY_BUY_ADDRESS : outputCurrency.address.toLowerCase()

  const isInputStableCoin = stableCoins.includes(inputAddress)
  const isOutputStableCoin = stableCoins.includes(outputAddress)

  const isInputWrappedNative = wrappedNativeToken.address.toLowerCase() === inputAddress
  const isOutputWrappedNative = wrappedNativeToken.address.toLowerCase() === outputAddress

  const isInputBtc = btcToken.address.toLowerCase() === inputAddress
  const isOutputBtc = btcToken.address.toLowerCase() === outputAddress

  if (isInputStableCoin) return outputCurrency
  if (isOutputStableCoin) return inputCurrency

  if (isInputWrappedNative || isInputBtc) return inputCurrency
  if (isOutputWrappedNative || isOutputBtc) return outputCurrency

  return isInputAmountSmallerThatOutput ? inputCurrency : outputCurrency
}
