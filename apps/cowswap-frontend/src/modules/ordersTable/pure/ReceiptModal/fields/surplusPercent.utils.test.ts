import BigNumber from 'bignumber.js'

import { formatSurplusPercent } from './surplusPercent.utils'

describe('formatSurplusPercent', () => {
  it('shows the percent with two decimals', () => {
    expect(formatSurplusPercent(new BigNumber('0.0125'))).toBe('+1.25%')
    expect(formatSurplusPercent(new BigNumber('0.0001'))).toBe('+0.01%')
  })

  it('shows <0.01% instead of +0.00% for a surplus too small to round up', () => {
    expect(formatSurplusPercent(new BigNumber('0.00000123'))).toBe('<0.01%')
    expect(formatSurplusPercent(new BigNumber('0.000099'))).toBe('<0.01%')
  })
})
