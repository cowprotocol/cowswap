import { NATIVE_CURRENCIES } from '@cowprotocol/common-const'
import { getCurrencyAddress } from '@cowprotocol/common-utils'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { Currency, Token } from '@cowprotocol/currency'
import { QuoteBridgeRequest } from '@cowprotocol/sdk-bridging'

import { DEFAULT_TRADE_QUOTE_STATE, TradeQuoteState } from 'modules/tradeQuote'

import { QuoteApiError, QuoteApiErrorCodes } from 'api/cowProtocol/errors/QuoteError'

import { isUnsupportedTokenInQuote } from './isUnsupportedTokenInQuote.utils'

const WETH = new Token(SupportedChainId.MAINNET, '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', 18, 'WETH', 'WETH')
const USDT = new Token(SupportedChainId.MAINNET, '0xdAC17F958D2ee523a2206206994597C13D831ec7', 6, 'USDT', 'USDT')
const USDC = new Token(SupportedChainId.MAINNET, '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', 6, 'USDC', 'USDC')
const DAI = new Token(SupportedChainId.MAINNET, '0x6B175474E89094C44Da98b954EedeAC495271d0F', 18, 'DAI', 'DAI')
const USDT_ON_GNOSIS = new Token(SupportedChainId.GNOSIS_CHAIN, USDT.address, 6, 'USDT', 'USDT')
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
    const state = getState({ error: unsupportedTokenError, errorQuoteParams: getErrorQuoteParams(WETH, USDT) })

    expect(isUnsupportedTokenInQuote(state, WETH, USDT)).toBe(true)
  })

  it('returns false when the buy token changed', () => {
    const state = getState({ error: unsupportedTokenError, errorQuoteParams: getErrorQuoteParams(WETH, USDT) })

    expect(isUnsupportedTokenInQuote(state, WETH, USDC)).toBe(false)
  })

  it('returns false when the sell token changed', () => {
    const state = getState({ error: unsupportedTokenError, errorQuoteParams: getErrorQuoteParams(WETH, USDT) })

    expect(isUnsupportedTokenInQuote(state, DAI, USDT)).toBe(false)
  })

  it('returns false when the buy token has the same address on another chain', () => {
    const state = getState({ error: unsupportedTokenError, errorQuoteParams: getErrorQuoteParams(WETH, USDT) })

    expect(isUnsupportedTokenInQuote(state, WETH, USDT_ON_GNOSIS)).toBe(false)
  })

  it('returns true when the error has no stored quote params', () => {
    const state = getState({ error: unsupportedTokenError })

    expect(isUnsupportedTokenInQuote(state, WETH, USDC)).toBe(true)
  })

  it('returns false for an error other than UnsupportedToken', () => {
    const state = getState({ error: noLiquidityError, errorQuoteParams: getErrorQuoteParams(WETH, USDT) })

    expect(isUnsupportedTokenInQuote(state, WETH, USDT)).toBe(false)
  })

  it('returns false when there is no error', () => {
    expect(isUnsupportedTokenInQuote(getState({}), WETH, USDT)).toBe(false)
  })

  it('matches a native sell token', () => {
    const state = getState({ error: unsupportedTokenError, errorQuoteParams: getErrorQuoteParams(ETH, USDT) })

    expect(isUnsupportedTokenInQuote(state, ETH, USDT)).toBe(true)
    expect(isUnsupportedTokenInQuote(state, WETH, USDT)).toBe(false)
  })
})
