import { PriceQuality } from '@cowprotocol/cow-sdk'

import { getIsFastQuote, getIsFinalQuote } from './getIsFastQuote'

import { TradeQuoteFetchParams } from '../types'

function params(priceQuality: PriceQuality): TradeQuoteFetchParams {
  return { hasParamsChanged: false, priceQuality, fetchStartTimestamp: 1 }
}

describe('getIsFinalQuote()', () => {
  it('Is false without fetch params, so gates relying on it stay closed until a quote is requested', () => {
    expect(getIsFinalQuote(undefined)).toBe(false)
    expect(getIsFinalQuote(null)).toBe(false)
  })

  it('Is false for the fast preview quote', () => {
    expect(getIsFinalQuote(params(PriceQuality.FAST))).toBe(false)
    expect(getIsFastQuote(params(PriceQuality.FAST))).toBe(true)
  })

  it('Is true for any non-fast price quality, so changing what we request does not close the gates', () => {
    expect(getIsFinalQuote(params(PriceQuality.VERIFIED))).toBe(true)
    expect(getIsFinalQuote(params(PriceQuality.OPTIMAL))).toBe(true)
  })
})
