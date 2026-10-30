import { OrderKind, type OrderParameters, type SolanaQuoteCosts } from '@cowprotocol/cow-sdk'

import { getSolanaCostsInSellAtoms } from 'modules/trade'

import { getQuoteFeeAmountRaw } from './getQuoteFeeAmountRaw'

// The real barrels pull the whole trade/quote module graph in, which cannot load under jest.
jest.mock('modules/trade', () => ({
  getSolanaCostsInSellAtoms: jest.fn(() => 1497148n),
}))
jest.mock('modules/tradeQuote', () => ({
  isSolanaQuoteAndPost: (quote: unknown) => !!quote && typeof quote === 'object' && 'solanaQuote' in quote,
}))

const ORDER_PARAMS = {
  kind: OrderKind.SELL,
  sellAmount: '20000000',
  buyAmount: '1857406',
  feeAmount: '0',
} as OrderParameters

const COSTS: SolanaQuoteCosts = {
  token: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
  networkFees: '904',
  buyTokenAtaCosts: '149387',
  protocolFee: '0',
  total: '150291',
}

const mockedCostsInSellAtoms = getSolanaCostsInSellAtoms as jest.MockedFunction<typeof getSolanaCostsInSellAtoms>

type Quote = Parameters<typeof getQuoteFeeAmountRaw>[0]

function quoteOf(orderParams: OrderParameters, costs?: SolanaQuoteCosts): Quote {
  const quote = { quoteResults: { quoteResponse: { quote: orderParams } } }

  return (costs ? { ...quote, solanaQuote: { costs } } : quote) as unknown as Quote
}

describe('getQuoteFeeAmountRaw', () => {
  it('returns nothing without a quote', () => {
    expect(getQuoteFeeAmountRaw(null)).toBeUndefined()
  })

  it('takes the fee an EVM quote reports as is', () => {
    expect(getQuoteFeeAmountRaw(quoteOf({ ...ORDER_PARAMS, feeAmount: '12345' }))).toBe('12345')
  })

  it('derives the fee from the costs a Solana quote nets out of its amounts', () => {
    expect(getQuoteFeeAmountRaw(quoteOf(ORDER_PARAMS, COSTS))).toBe('1497148')
  })

  it('reports a zero fee rather than nothing when a Solana quote carries no costs', () => {
    mockedCostsInSellAtoms.mockReturnValueOnce(0n)

    // Not `undefined`: that would leave the limit form without a fee at all, blanking the estimated
    // fill price instead of falling back to the market price.
    expect(getQuoteFeeAmountRaw(quoteOf(ORDER_PARAMS, COSTS))).toBe('0')
  })
})
