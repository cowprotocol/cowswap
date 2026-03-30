import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { CurrencyAmount } from '@uniswap/sdk-core'

import JSBI from 'jsbi'

import { getMaxTwapPartsForSellAmount } from './getMaxTwapPartsForSellAmount'

import { MINIMUM_PART_SELL_AMOUNT_FIAT } from '../const'

describe('getMaxTwapPartsForSellAmount', () => {
  const minimum = MINIMUM_PART_SELL_AMOUNT_FIAT[SupportedChainId.GNOSIS_CHAIN]

  if (!minimum) {
    throw new Error('Missing GNOSIS minimum fiat amount')
  }

  it('returns 1 when required values are missing', () => {
    expect(getMaxTwapPartsForSellAmount(null, minimum)).toBe(1)
    expect(getMaxTwapPartsForSellAmount(minimum, null)).toBe(1)
  })

  it('returns 1 when total amount is zero', () => {
    const zero = CurrencyAmount.fromRawAmount(minimum.currency, JSBI.BigInt(0))

    expect(getMaxTwapPartsForSellAmount(zero, minimum)).toBe(1)
  })

  it('returns floor(total/minimum) directly from total sell size', () => {
    const total = CurrencyAmount.fromRawAmount(minimum.currency, JSBI.multiply(minimum.quotient, JSBI.BigInt(30)))

    expect(getMaxTwapPartsForSellAmount(total, minimum)).toBe(30)
  })

  it('returns 12 when total amount equals 12 times the minimum threshold', () => {
    const total = CurrencyAmount.fromRawAmount(minimum.currency, JSBI.multiply(minimum.quotient, JSBI.BigInt(12)))

    expect(getMaxTwapPartsForSellAmount(total, minimum)).toBe(12)
  })
})
