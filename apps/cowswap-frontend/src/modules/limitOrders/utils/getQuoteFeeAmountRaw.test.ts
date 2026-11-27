import { OrderKind, type OrderParameters } from '@cowprotocol/cow-sdk'

import { getQuoteFeeAmountRaw } from './getQuoteFeeAmountRaw'

// The real barrels pull the whole trade/quote module graph in, which cannot load under jest.
jest.mock('modules/trade', () => jest.requireActual('../../trade/utils/reportsFeeInSellToken'))
jest.mock('modules/tradeQuote', () => ({
  isSolanaQuoteAndPost: (quote: unknown) => !!quote && typeof quote === 'object' && 'solanaQuote' in quote,
}))

const ORDER_PARAMS = {
  kind: OrderKind.SELL,
  sellAmount: '20000000',
  buyAmount: '1857406',
  feeAmount: '0',
} as OrderParameters

type Quote = Parameters<typeof getQuoteFeeAmountRaw>[0]

function quoteOf(orderParams: OrderParameters, solanaNetworkFeeInSell?: bigint): Quote {
  const quoteResults = {
    quoteResponse: { quote: orderParams },
    amountsAndCosts: { costs: { networkFee: { amountInSellCurrency: solanaNetworkFeeInSell ?? 0n } } },
  }

  return (solanaNetworkFeeInSell === undefined
    ? { quoteResults }
    : { quoteResults, solanaQuote: {} }) as unknown as Quote
}

describe('getQuoteFeeAmountRaw', () => {
  it('returns nothing without a quote', () => {
    expect(getQuoteFeeAmountRaw(null)).toBeUndefined()
  })

  it('takes the fee an EVM quote reports as is', () => {
    expect(getQuoteFeeAmountRaw(quoteOf({ ...ORDER_PARAMS, feeAmount: '12345' }))).toBe('12345')
  })

  it('takes the network fee in the sell token from the breakdown of a Solana quote', () => {
    expect(getQuoteFeeAmountRaw(quoteOf(ORDER_PARAMS, 1497148n))).toBe('1497148')
  })

  it('takes the fee a Solana quote already reports as is, rather than the breakdown of its costs', () => {
    expect(getQuoteFeeAmountRaw(quoteOf({ ...ORDER_PARAMS, feeAmount: '1500000' }, 1497148n))).toBe('1500000')
  })

  it('reports a zero fee rather than nothing when a Solana quote carries no costs', () => {
    // Not `undefined`: that would leave the limit form without a fee at all, blanking the estimated
    // fill price instead of falling back to the market price.
    expect(getQuoteFeeAmountRaw(quoteOf(ORDER_PARAMS, 0n))).toBe('0')
  })
})
