import { NATIVE_CURRENCIES, WRAPPED_NATIVE_CURRENCIES } from '@cowprotocol/common-const'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { Token } from '@cowprotocol/currency'

import { isQuoteForCurrencies } from './isQuoteForCurrencies'

import { DEFAULT_TRADE_QUOTE_STATE, TradeQuoteState } from '../state/tradeQuoteAtom'

const chainId = SupportedChainId.MAINNET
const COW = new Token(chainId, '0xDEf1CA1fb7FBcDC777520aa7f396b4E015F497aB', 18, 'COW', 'CoW')
const USDC = new Token(chainId, '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', 6, 'USDC', 'USDC')
const DAI = new Token(chainId, '0x6B175474E89094C44Da98b954EedeAC495271d0F', 18, 'DAI', 'DAI')

function quoteState(sellToken: string, buyToken: string, bridgeBuyToken?: string): TradeQuoteState {
  return {
    ...DEFAULT_TRADE_QUOTE_STATE,
    quote: { quoteResults: { quoteResponse: { quote: { sellToken, buyToken } } } },
    bridgeQuote: bridgeBuyToken ? { tradeParameters: { buyTokenAddress: bridgeBuyToken } } : null,
  } as unknown as TradeQuoteState
}

describe('isQuoteForCurrencies()', () => {
  it('is false without a quote', () => {
    expect(isQuoteForCurrencies(DEFAULT_TRADE_QUOTE_STATE, COW, USDC)).toBe(false)
  })

  it('is true when the quote is for the same pair, regardless of address case', () => {
    expect(isQuoteForCurrencies(quoteState(COW.address.toLowerCase(), USDC.address), COW, USDC)).toBe(true)
  })

  it('is false when the sell token differs', () => {
    expect(isQuoteForCurrencies(quoteState(DAI.address, USDC.address), COW, USDC)).toBe(false)
  })

  it('is false when the buy token differs', () => {
    expect(isQuoteForCurrencies(quoteState(COW.address, DAI.address), COW, USDC)).toBe(false)
  })

  it('matches a native currency quoted against its wrapped token', () => {
    const wrapped = WRAPPED_NATIVE_CURRENCIES[chainId]

    expect(isQuoteForCurrencies(quoteState(wrapped.address, USDC.address), NATIVE_CURRENCIES[chainId], USDC)).toBe(true)
  })

  it('uses the bridge buy token for bridge quotes', () => {
    expect(isQuoteForCurrencies(quoteState(COW.address, DAI.address, USDC.address), COW, USDC)).toBe(true)
    expect(isQuoteForCurrencies(quoteState(COW.address, USDC.address, DAI.address), COW, USDC)).toBe(false)
  })
})
