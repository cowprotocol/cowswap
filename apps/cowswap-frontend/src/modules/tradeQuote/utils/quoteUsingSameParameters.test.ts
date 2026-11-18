import { QuoteBridgeRequest } from '@cowprotocol/sdk-bridging'

import { quoteUsingSameParameters } from './quoteUsingSameParameters'

import { DEFAULT_TRADE_QUOTE_STATE, TradeQuoteState } from '../state/tradeQuoteAtom'

const SELL_TOKEN = 'So11111111111111111111111111111111111111112'
const BUY_TOKEN = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'

const baseTradeParameters = {
  owner: 'owner',
  kind: 'sell',
  amount: '1000',
  validFor: 1800,
  receiver: 'owner',
  sellToken: SELL_TOKEN,
  buyToken: BUY_TOKEN,
}

function nextParams(swapSlippageBps: number | undefined): QuoteBridgeRequest {
  return {
    owner: 'owner',
    kind: 'sell',
    amount: 1000n,
    validFor: 1800,
    receiver: 'owner',
    sellTokenAddress: SELL_TOKEN,
    buyTokenAddress: BUY_TOKEN,
    swapSlippageBps,
  } as unknown as QuoteBridgeRequest
}

function quoteState(slippageBps: number | undefined, isSolana: boolean): TradeQuoteState {
  return {
    ...DEFAULT_TRADE_QUOTE_STATE,
    quote: {
      quoteResults: { tradeParameters: { ...baseTradeParameters, slippageBps } },
      ...(isSolana ? { solanaQuote: {} } : null),
    },
  } as unknown as TradeQuoteState
}

describe('quoteUsingSameParameters() slippage', () => {
  describe('Solana quote', () => {
    it('is the same when neither request passed a slippage', () => {
      expect(
        quoteUsingSameParameters(quoteState(undefined, true), nextParams(undefined), undefined, undefined, true),
      ).toBe(true)
    })

    it('ignores appData, which a Solana quote never carries', () => {
      const appData = { appCode: 'CoW Swap', metadata: {} } as unknown as Parameters<typeof quoteUsingSameParameters>[3]

      expect(
        quoteUsingSameParameters(quoteState(undefined, true), nextParams(undefined), undefined, appData, true),
      ).toBe(true)
    })

    it('requotes when the slippage switches from explicit to the quote suggestion', () => {
      expect(quoteUsingSameParameters(quoteState(50, true), nextParams(undefined), undefined, undefined, true)).toBe(
        false,
      )
    })

    it('requotes when the slippage switches from the quote suggestion to explicit', () => {
      expect(quoteUsingSameParameters(quoteState(undefined, true), nextParams(50), undefined, undefined, false)).toBe(
        false,
      )
    })

    it('requotes when the explicit slippage changes even with smart slippage', () => {
      expect(quoteUsingSameParameters(quoteState(50, true), nextParams(80), undefined, undefined, true)).toBe(false)
    })
  })

  describe('EVM quote', () => {
    it('ignores slippage changes with smart slippage', () => {
      expect(quoteUsingSameParameters(quoteState(50, false), nextParams(80), undefined, undefined, true)).toBe(true)
    })

    it('requotes when appData appears', () => {
      const appData = { appCode: 'CoW Swap', metadata: {} } as unknown as Parameters<typeof quoteUsingSameParameters>[3]

      expect(quoteUsingSameParameters(quoteState(50, false), nextParams(50), undefined, appData, false)).toBe(false)
    })

    it('ignores a missing next slippage', () => {
      expect(quoteUsingSameParameters(quoteState(50, false), nextParams(undefined), undefined, undefined, false)).toBe(
        true,
      )
    })
  })
})

type AppDataDoc = Parameters<typeof quoteUsingSameParameters>[3]

function appDataDoc(orderClass: string, slippageBips: number): AppDataDoc {
  return {
    appCode: 'CoW Swap',
    metadata: { orderClass: { orderClass }, quote: { slippageBips } },
  } as unknown as AppDataDoc
}

function evmNextParams(partiallyFillable: boolean): QuoteBridgeRequest {
  return { ...nextParams(10), partiallyFillable } as QuoteBridgeRequest
}

function evmQuoteState(partiallyFillable: boolean): TradeQuoteState {
  return {
    ...DEFAULT_TRADE_QUOTE_STATE,
    quote: {
      quoteResults: { tradeParameters: { ...baseTradeParameters, slippageBps: 0, partiallyFillable } },
    },
  } as unknown as TradeQuoteState
}

describe('quoteUsingSameParameters() order type', () => {
  it('requotes a Limit quote for a Swap form with the same pair and amount', () => {
    expect(
      quoteUsingSameParameters(
        evmQuoteState(false),
        evmNextParams(false),
        appDataDoc('limit', 0),
        appDataDoc('market', 10),
        false,
      ),
    ).toBe(false)
  })

  it('requotes when partiallyFillable changes', () => {
    expect(
      quoteUsingSameParameters(
        evmQuoteState(true),
        evmNextParams(false),
        appDataDoc('market', 10),
        appDataDoc('market', 10),
        false,
      ),
    ).toBe(false)
  })

  it('keeps the quote when only the quote slippage metadata changes', () => {
    expect(
      quoteUsingSameParameters(
        evmQuoteState(false),
        evmNextParams(false),
        appDataDoc('market', 10),
        appDataDoc('market', 50),
        true,
      ),
    ).toBe(true)
  })
})
