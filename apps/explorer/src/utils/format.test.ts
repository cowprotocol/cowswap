import { TokenErc20 } from '@gnosis.pm/dex-js'
import BigNumber from 'bignumber.js'

import { formatCalculatedPriceToDisplay, formatSmart, formatSmartMaxPrecision } from './format'

const WETH: TokenErc20 = { address: '0x1', symbol: 'WETH', name: 'Wrapped Ether', decimals: 18 }
const USDC: TokenErc20 = { address: '0x2', symbol: 'USDC', name: 'USD Coin', decimals: 6 }

describe('formatSmart', () => {
  it('drops the decimal separator when the shown decimals are all zeros', () => {
    expect(formatSmart({ amount: '123.00001', precision: 0, decimals: 8, isLocaleAware: false })).toBe('123')
  })

  it('keeps significant decimals', () => {
    expect(formatSmart({ amount: '123.45006', precision: 0, decimals: 8, isLocaleAware: false })).toBe('123.45')
  })

  it('keeps amounts below the small limit as is', () => {
    expect(
      formatSmart({ amount: '0.00001', precision: 0, decimals: 8, smallLimit: '0.001', isLocaleAware: false }),
    ).toBe('< 0.001')
  })
})

describe('formatSmartMaxPrecision', () => {
  it('does not leave a trailing period on amounts with only tiny decimals', () => {
    expect(formatSmartMaxPrecision(new BigNumber('123000010000000000000'), WETH)).toBe('123')
  })
})

describe('formatCalculatedPriceToDisplay', () => {
  it('does not leave a trailing period on a limit price with only tiny decimals', () => {
    expect(formatCalculatedPriceToDisplay(new BigNumber('250.00000123'), WETH, USDC)).toBe('250 USDC')
  })
})
