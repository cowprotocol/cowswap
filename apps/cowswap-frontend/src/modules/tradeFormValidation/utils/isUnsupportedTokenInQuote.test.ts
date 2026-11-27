import { DAI, NATIVE_CURRENCIES, USDC_MAINNET, USDT, WETH_MAINNET } from '@cowprotocol/common-const'
import { getCurrencyAddress } from '@cowprotocol/common-utils'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { Currency } from '@cowprotocol/currency'
import { QuoteBridgeRequest } from '@cowprotocol/sdk-bridging'

import { DEFAULT_TRADE_QUOTE_STATE, TradeQuoteState } from 'modules/tradeQuote'

import { QuoteApiError, QuoteApiErrorCodes } from 'api/cowProtocol/errors/QuoteError'

import { isUnsupportedTokenInQuote } from './isUnsupportedTokenInQuote.utils'

const ETH = NATIVE_CURRENCIES[SupportedChainId.MAINNET]

const unsupportedTokenError = new QuoteApiError({
  errorType: QuoteApiErrorCodes.UnsupportedToken,
  description: 'Token is not supported',
})

const noLiquidityError = new QuoteApiError({
  errorType: QuoteApiErrorCodes.NoLiquidity,
  description: 'No liquidity',
})

function getErrorQuoteParams(sell: Currency, buy: Currency): QuoteBridgeRequest {
  return {
    sellTokenChainId: sell.chainId,
    sellTokenAddress: getCurrencyAddress(sell),
    buyTokenChainId: buy.chainId,
    buyTokenAddress: getCurrencyAddress(buy),
  } as QuoteBridgeRequest
}

function getState(overrides: Partial<TradeQuoteState>): TradeQuoteState {
  return { ...DEFAULT_TRADE_QUOTE_STATE, ...overrides }
}

describe('isUnsupportedTokenInQuote', () => {
  it('returns true when the error was returned for the current pair', () => {
    const state = getState({ error: unsupportedTokenError, errorQuoteParams: getErrorQuoteParams(WETH_MAINNET, USDT) })

    expect(isUnsupportedTokenInQuote(state, WETH_MAINNET, USDT)).toBe(true)
  })

  it('returns false when the buy token changed', () => {
    const state = getState({ error: unsupportedTokenError, errorQuoteParams: getErrorQuoteParams(WETH_MAINNET, USDT) })

    expect(isUnsupportedTokenInQuote(state, WETH_MAINNET, USDC_MAINNET)).toBe(false)
  })

  it('returns false when the sell token changed', () => {
    const state = getState({ error: unsupportedTokenError, errorQuoteParams: getErrorQuoteParams(WETH_MAINNET, USDT) })

    expect(isUnsupportedTokenInQuote(state, DAI, USDT)).toBe(false)
  })

  it('returns false when the error was for the same buy token address on another chain', () => {
    const errorQuoteParams = {
      ...getErrorQuoteParams(WETH_MAINNET, USDT),
      buyTokenChainId: SupportedChainId.GNOSIS_CHAIN,
    }
    const state = getState({ error: unsupportedTokenError, errorQuoteParams })

    expect(isUnsupportedTokenInQuote(state, WETH_MAINNET, USDT)).toBe(false)
  })

  it('returns true when the error has no stored quote params', () => {
    const state = getState({ error: unsupportedTokenError })

    expect(isUnsupportedTokenInQuote(state, WETH_MAINNET, USDC_MAINNET)).toBe(true)
  })

  it('returns false for an error other than UnsupportedToken', () => {
    const state = getState({ error: noLiquidityError, errorQuoteParams: getErrorQuoteParams(WETH_MAINNET, USDT) })

    expect(isUnsupportedTokenInQuote(state, WETH_MAINNET, USDT)).toBe(false)
  })

  it('returns false when there is no error', () => {
    expect(isUnsupportedTokenInQuote(getState({}), WETH_MAINNET, USDT)).toBe(false)
  })

  it('matches a native sell token', () => {
    const state = getState({ error: unsupportedTokenError, errorQuoteParams: getErrorQuoteParams(ETH, USDT) })

    expect(isUnsupportedTokenInQuote(state, ETH, USDT)).toBe(true)
    expect(isUnsupportedTokenInQuote(state, WETH_MAINNET, USDT)).toBe(false)
  })
})
