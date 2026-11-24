import { getWaitAndSaveWaivedFeeRawAmount, parsePositiveBuyAmount } from './waitAndSaveWaivedFee'

import type { WaitAndSaveComparisonQuote } from '../state/waitAndSaveComparisonQuoteAtom'

const comparison = (overrides: Partial<WaitAndSaveComparisonQuote> = {}): WaitAndSaveComparisonQuote => ({
  buyAmount: '110',
  enableWaitForCow: true,
  mainBuyAmount: '100',
  ...overrides,
})

describe('getWaitAndSaveWaivedFeeRawAmount', () => {
  it('uses the on-quote buy amount minus the off-quote buy amount when Wait & Save is off', () => {
    expect(
      getWaitAndSaveWaivedFeeRawAmount({
        comparison: comparison(),
        mainBuyAmount: '100',
        userQuoteWithWaitAndSave: false,
      }),
    ).toBe(10n)
  })

  it('uses the main quote as the on-quote when Wait & Save is on', () => {
    expect(
      getWaitAndSaveWaivedFeeRawAmount({
        comparison: comparison({ buyAmount: '100', enableWaitForCow: false, mainBuyAmount: '115' }),
        mainBuyAmount: '115',
        userQuoteWithWaitAndSave: true,
      }),
    ).toBe(15n)
  })

  it('omits a missing comparison', () => {
    expect(
      getWaitAndSaveWaivedFeeRawAmount({ comparison: null, mainBuyAmount: '100', userQuoteWithWaitAndSave: false }),
    ).toBeUndefined()
  })

  it('omits a stale comparison for a different main buy amount', () => {
    expect(
      getWaitAndSaveWaivedFeeRawAmount({
        comparison: comparison({ mainBuyAmount: '90' }),
        mainBuyAmount: '100',
        userQuoteWithWaitAndSave: false,
      }),
    ).toBeUndefined()
  })

  it('omits a comparison requested for the same mode', () => {
    expect(
      getWaitAndSaveWaivedFeeRawAmount({
        comparison: comparison({ enableWaitForCow: false }),
        mainBuyAmount: '100',
        userQuoteWithWaitAndSave: false,
      }),
    ).toBeUndefined()
  })

  it('omits a delta that is not positive', () => {
    expect(
      getWaitAndSaveWaivedFeeRawAmount({
        comparison: comparison({ buyAmount: '100' }),
        mainBuyAmount: '100',
        userQuoteWithWaitAndSave: false,
      }),
    ).toBeUndefined()
    expect(
      getWaitAndSaveWaivedFeeRawAmount({
        comparison: comparison({ buyAmount: '80' }),
        mainBuyAmount: '100',
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
