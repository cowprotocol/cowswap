import { maxUint256 } from 'viem'

import { CurrencyAmount, Token } from '@cowprotocol/currency'

import { getEoaTwapAmountToApprove } from './getEoaTwapAmountToApprove'

const token = new Token(1, '0x1111111111111111111111111111111111111111', 18, 'SELL', 'Sell Token')

describe('getEoaTwapAmountToApprove()', () => {
  const amountToCover = 1_010_000n

  it('returns maxUint256 when amountToSignApprove is null', () => {
    expect(getEoaTwapAmountToApprove(null, amountToCover)).toBe(maxUint256)
  })

  it('returns maxUint256 when the user selected an unlimited approve', () => {
    const amountToSignApprove = CurrencyAmount.fromRawAmount(token, maxUint256.toString())

    expect(getEoaTwapAmountToApprove(amountToSignApprove, amountToCover)).toBe(maxUint256)
  })

  it('returns amountToCover when the selected partial amount is below it', () => {
    const amountToSignApprove = CurrencyAmount.fromRawAmount(token, '1000000')

    expect(getEoaTwapAmountToApprove(amountToSignApprove, amountToCover)).toBe(amountToCover)
  })

  it('returns the selected partial amount when it exceeds amountToCover', () => {
    const amountToSignApprove = CurrencyAmount.fromRawAmount(token, '2000000')

    expect(getEoaTwapAmountToApprove(amountToSignApprove, amountToCover)).toBe(2_000_000n)
  })
})
