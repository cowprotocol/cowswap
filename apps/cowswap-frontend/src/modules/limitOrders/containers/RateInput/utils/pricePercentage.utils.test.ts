import { USDC_MAINNET, WRAPPED_NATIVE_CURRENCIES } from '@cowprotocol/common-const'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { Fraction } from '@cowprotocol/currency'

import { getPercentageRate } from 'modules/trade'

import { getQuoteCurrencyByStableCoin } from 'common/services/getQuoteCurrency'

import { getPercentageLockedInversion, getSelectedPercentage, getSelectedPreset } from './pricePercentage.utils'

const WETH = WRAPPED_NATIVE_CURRENCIES[SupportedChainId.MAINNET]
const TAKE_PROFIT_SELECTION = { value: '10', isInverted: false }

describe('getPercentageLockedInversion', () => {
  it('keeps a take-profit percentage on the original price direction', () => {
    expect(getPercentageLockedInversion(TAKE_PROFIT_SELECTION, false)).toBe(false)
  })

  it('keeps an inverted percentage selection inverted', () => {
    expect(getPercentageLockedInversion({ value: '10', isInverted: true }, false)).toBe(true)
  })

  it('keeps custom take-profit entry on the original price direction', () => {
    expect(getPercentageLockedInversion(null, true)).toBe(false)
  })

  it('does not lock quote-currency inversion without a percentage', () => {
    expect(getPercentageLockedInversion(null, false)).toBe(null)
  })
})

describe('take-profit quote inversion', () => {
  const marketRate = new Fraction(1, 2010)
  const activeRate = getPercentageRate(marketRate, '10', false)

  it('would invert a received-stablecoin pair without a locked percentage', () => {
    expect(getQuoteCurrencyByStableCoin(SupportedChainId.MAINNET, USDC_MAINNET, WETH)).toBe(WETH)
  })

  it('keeps +10% selected when inversion stays aligned with take-profit', () => {
    expect(getPercentageLockedInversion(TAKE_PROFIT_SELECTION, false)).toBe(false)
    expect(getSelectedPercentage(TAKE_PROFIT_SELECTION, false)).toBe('10')
    expect(getSelectedPreset(marketRate, activeRate, false)).toBe('10')
  })

  it('loses the +10% preset if quote-currency inversion is applied anyway', () => {
    expect(getSelectedPercentage(TAKE_PROFIT_SELECTION, true)).toBe('9.09')
    expect(getSelectedPreset(marketRate, activeRate, true)).toBeUndefined()
  })
})
