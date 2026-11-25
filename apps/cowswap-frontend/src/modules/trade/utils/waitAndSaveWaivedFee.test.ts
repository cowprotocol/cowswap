import { OrderKind } from '@cowprotocol/cow-sdk'

import {
  getWaitAndSaveWaivedFeeRawAmount,
  parsePositiveBuyAmount,
  type WaitAndSaveMainQuote,
} from './waitAndSaveWaivedFee'

import type { WaitAndSaveComparisonQuote } from '../state/waitAndSaveComparisonQuoteAtom'

const comparison = (overrides: Partial<WaitAndSaveComparisonQuote> = {}): WaitAndSaveComparisonQuote => ({
  buyAmount: '110',
  enableWaitForCow: true,
  feeAmount: '0',
  mainBuyAmount: '100',
  mainFeeAmount: '0',
  mainSellAmount: '1000',
  sellAmount: '1000',
  ...overrides,
})

const mainQuote = (overrides: Partial<WaitAndSaveMainQuote> = {}): WaitAndSaveMainQuote => ({
  buyAmount: '100',
  feeAmount: '0',
  sellAmount: '1000',
  ...overrides,
})

describe('getWaitAndSaveWaivedFeeRawAmount', () => {
  it('uses the on-quote buy amount minus the off-quote buy amount when Wait & Save is off', () => {
    expect(
      getWaitAndSaveWaivedFeeRawAmount({
        comparison: comparison(),
        mainQuote: mainQuote(),
        orderKind: OrderKind.SELL,
        userQuoteWithWaitAndSave: false,
      }),
    ).toEqual({ amount: 10n, currency: 'buy' })
  })

  it('uses the main quote as the on-quote when Wait & Save is on', () => {
    expect(
      getWaitAndSaveWaivedFeeRawAmount({
        comparison: comparison({ buyAmount: '100', enableWaitForCow: false, mainBuyAmount: '115' }),
        mainQuote: mainQuote({ buyAmount: '115' }),
        orderKind: OrderKind.SELL,
        userQuoteWithWaitAndSave: true,
      }),
    ).toEqual({ amount: 15n, currency: 'buy' })
  })

  it('keeps a sell-order delta on the buy amounts when the sell amounts differ', () => {
    expect(
      getWaitAndSaveWaivedFeeRawAmount({
        comparison: comparison({ feeAmount: '4', sellAmount: '800' }),
        mainQuote: mainQuote({ feeAmount: '9', sellAmount: '1200' }),
        orderKind: OrderKind.SELL,
        userQuoteWithWaitAndSave: false,
      }),
    ).toEqual({ amount: 10n, currency: 'buy' })
  })

  it('uses the off-quote gross sell minus the on-quote gross sell for a buy order', () => {
    expect(
      getWaitAndSaveWaivedFeeRawAmount({
        comparison: comparison({
          buyAmount: '500',
          feeAmount: '10',
          mainBuyAmount: '500',
          mainFeeAmount: '10',
          mainSellAmount: '1000',
          sellAmount: '900',
        }),
        mainQuote: mainQuote({ buyAmount: '500', feeAmount: '10', sellAmount: '1000' }),
        orderKind: OrderKind.BUY,
        userQuoteWithWaitAndSave: false,
      }),
    ).toEqual({ amount: 100n, currency: 'sell' })
  })

  it('uses the main quote as the cheaper sell when Wait & Save is on for a buy order', () => {
    expect(
      getWaitAndSaveWaivedFeeRawAmount({
        comparison: comparison({
          buyAmount: '500',
          enableWaitForCow: false,
          feeAmount: '10',
          mainBuyAmount: '500',
          mainFeeAmount: '10',
          mainSellAmount: '900',
          sellAmount: '1000',
        }),
        mainQuote: mainQuote({ buyAmount: '500', feeAmount: '10', sellAmount: '900' }),
        orderKind: OrderKind.BUY,
        userQuoteWithWaitAndSave: true,
      }),
    ).toEqual({ amount: 100n, currency: 'sell' })
  })

  it('includes a network fee that the two buy-order quotes do not share', () => {
    expect(
      getWaitAndSaveWaivedFeeRawAmount({
        comparison: comparison({
          buyAmount: '500',
          feeAmount: '10',
          mainBuyAmount: '500',
          mainFeeAmount: '25',
          mainSellAmount: '1000',
          sellAmount: '900',
        }),
        mainQuote: mainQuote({ buyAmount: '500', feeAmount: '25', sellAmount: '1000' }),
        orderKind: OrderKind.BUY,
        userQuoteWithWaitAndSave: false,
      }),
    ).toEqual({ amount: 115n, currency: 'sell' })
  })

  it('omits a missing comparison', () => {
    expect(
      getWaitAndSaveWaivedFeeRawAmount({
        comparison: null,
        mainQuote: mainQuote(),
        orderKind: OrderKind.SELL,
        userQuoteWithWaitAndSave: false,
      }),
    ).toBeUndefined()
  })

  it('omits a stale comparison for a different main buy amount', () => {
    expect(
      getWaitAndSaveWaivedFeeRawAmount({
        comparison: comparison({ mainBuyAmount: '90' }),
        mainQuote: mainQuote(),
        orderKind: OrderKind.SELL,
        userQuoteWithWaitAndSave: false,
      }),
    ).toBeUndefined()
  })

  it('omits a stale buy-order comparison when the main gross sell moved', () => {
    expect(
      getWaitAndSaveWaivedFeeRawAmount({
        comparison: comparison({
          buyAmount: '500',
          feeAmount: '10',
          mainBuyAmount: '500',
          mainFeeAmount: '10',
          mainSellAmount: '1000',
          sellAmount: '900',
        }),
        mainQuote: mainQuote({ buyAmount: '500', feeAmount: '10', sellAmount: '1100' }),
        orderKind: OrderKind.BUY,
        userQuoteWithWaitAndSave: false,
      }),
    ).toBeUndefined()
  })

  it('omits a comparison requested for the same mode', () => {
    expect(
      getWaitAndSaveWaivedFeeRawAmount({
        comparison: comparison({ enableWaitForCow: false }),
        mainQuote: mainQuote(),
        orderKind: OrderKind.SELL,
        userQuoteWithWaitAndSave: false,
      }),
    ).toBeUndefined()
  })

  it('omits a delta that is not positive', () => {
    expect(
      getWaitAndSaveWaivedFeeRawAmount({
        comparison: comparison({ buyAmount: '100' }),
        mainQuote: mainQuote(),
        orderKind: OrderKind.SELL,
        userQuoteWithWaitAndSave: false,
      }),
    ).toBeUndefined()
    expect(
      getWaitAndSaveWaivedFeeRawAmount({
        comparison: comparison({ buyAmount: '80' }),
        mainQuote: mainQuote(),
        orderKind: OrderKind.SELL,
        userQuoteWithWaitAndSave: false,
      }),
    ).toBeUndefined()
    expect(
      getWaitAndSaveWaivedFeeRawAmount({
        comparison: comparison({
          buyAmount: '500',
          feeAmount: '10',
          mainBuyAmount: '500',
          mainFeeAmount: '10',
          sellAmount: '1000',
        }),
        mainQuote: mainQuote({ buyAmount: '500', feeAmount: '10', sellAmount: '1000' }),
        orderKind: OrderKind.BUY,
        userQuoteWithWaitAndSave: false,
      }),
    ).toBeUndefined()
  })
})

describe('parsePositiveBuyAmount', () => {
  it('accepts a positive integer atom amount', () => {
    expect(parsePositiveBuyAmount('250000')).toBe(250000n)
  })

  it('rejects missing, zero, and non-integer amounts', () => {
    expect(parsePositiveBuyAmount(undefined)).toBeUndefined()
    expect(parsePositiveBuyAmount('0')).toBeUndefined()
    expect(parsePositiveBuyAmount('-1')).toBeUndefined()
    expect(parsePositiveBuyAmount('1.5')).toBeUndefined()
  })
})
