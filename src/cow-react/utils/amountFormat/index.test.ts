import { formatTokenAmount } from './index'
import { CurrencyAmount } from '@uniswap/sdk-core'
import { DAI_GOERLI } from 'utils/goerli/constants'

describe('Amounts formatting', () => {
  const decimals = DAI_GOERLI.decimals
  const getAmount = (value: string, decimalsShift: number) =>
    CurrencyAmount.fromRawAmount(DAI_GOERLI, value + '0'.repeat(decimals + decimalsShift))

  it('Zero amount', () => {
    const result = formatTokenAmount(getAmount('0', 0))

    expect(result).toBe('0')
  })

  it('Extra small amount', () => {
    const result = formatTokenAmount(getAmount('1', -decimals))

    expect(result).toBe('< 0.000001')
  })

  it('Small amount', () => {
    const result = formatTokenAmount(getAmount('1', -4))

    expect(result).toBe('0.0001')
  })

  it('One amount', () => {
    const result = formatTokenAmount(getAmount('1', 0))

    expect(result).toBe('1')
  })

  it('Regular amount', () => {
    const result = formatTokenAmount(getAmount('1', 3))

    expect(result).toBe('1,000')
  })

  it('Thousands amount', () => {
    const result = formatTokenAmount(getAmount('1', 4))

    expect(result).toBe('10,000')
  })

  it('Hundreds thousands amount', () => {
    const result = formatTokenAmount(getAmount('23', 4))

    expect(result).toBe('230,000')
  })

  it('Millions amount', () => {
    const result = formatTokenAmount(getAmount('5456', 3))

    expect(result).toBe('5,456,000')
  })

  it('Billions amount', () => {
    const result = formatTokenAmount(getAmount('9307222438', 0))

    expect(result).toBe('9.307B')
  })

  it('Trillions amount', () => {
    const result = formatTokenAmount(getAmount('45676822', 9))

    expect(result).toBe('45,676.822T')
  })
})
