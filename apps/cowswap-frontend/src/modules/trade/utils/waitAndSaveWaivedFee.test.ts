import { getWaitAndSaveWaivedFeeRawAmount, parsePositiveBuyAmount } from './waitAndSaveWaivedFee'

import type { WaitAndSaveComparisonQuote } from '../state/waitAndSaveComparisonQuoteAtom'

const comparison = (overrides: Partial<WaitAndSaveComparisonQuote> = {}): WaitAndSaveComparisonQuote => ({
  buyAmount: '110',
  isOnQuote: true,
  mainBuyAmount: '100',
  ...overrides,
})

describe('getWaitAndSaveWaivedFeeRawAmount', () => {
  it('uses the on-quote buy amount minus the off-quote buy amount when Wait & Save is off', () => {
    expect(
      getWaitAndSaveWaivedFeeRawAmount({
        comparison: comparison(),
        isEnabled: false,
        mainBuyAmount: '100',
      }),
    ).toBe(10n)
  })

  it('uses the main quote as the on-quote when Wait & Save is on', () => {
    expect(
      getWaitAndSaveWaivedFeeRawAmount({
        comparison: comparison({ buyAmount: '100', isOnQuote: false, mainBuyAmount: '115' }),
        isEnabled: true,
        mainBuyAmount: '115',
      }),
    ).toBe(15n)
  })

  it('omits a missing comparison', () => {
    expect(
      getWaitAndSaveWaivedFeeRawAmount({ comparison: null, isEnabled: false, mainBuyAmount: '100' }),
    ).toBeUndefined()
  })

  it('omits a stale comparison for a different main buy amount', () => {
    expect(
      getWaitAndSaveWaivedFeeRawAmount({
        comparison: comparison({ mainBuyAmount: '90' }),
        isEnabled: false,
        mainBuyAmount: '100',
      }),
    ).toBeUndefined()
  })

  it('omits a comparison requested for the same mode', () => {
    expect(
      getWaitAndSaveWaivedFeeRawAmount({
        comparison: comparison({ isOnQuote: false }),
        isEnabled: false,
        mainBuyAmount: '100',
      }),
    ).toBeUndefined()
  })

  it('omits a delta that is not positive', () => {
    expect(
      getWaitAndSaveWaivedFeeRawAmount({
        comparison: comparison({ buyAmount: '100' }),
        isEnabled: false,
        mainBuyAmount: '100',
      }),
    ).toBeUndefined()
    expect(
      getWaitAndSaveWaivedFeeRawAmount({
        comparison: comparison({ buyAmount: '80' }),
        isEnabled: false,
        mainBuyAmount: '100',
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
