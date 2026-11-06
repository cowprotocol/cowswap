import { maxUint256 } from 'viem'

import { getEoaTwapPollerAmountToApprove } from './getEoaTwapPollerAmountToApprove'

describe('getEoaTwapPollerAmountToApprove()', () => {
  it('returns unlimited for Dai-like permits', () => {
    expect(
      getEoaTwapPollerAmountToApprove({
        amountToApprove: 1_000_000n,
        sellAmount: 500_000n,
        isDaiLikePermit: true,
      }),
    ).toBe(maxUint256)
  })

  it('keeps a positive partial or unlimited amount', () => {
    expect(
      getEoaTwapPollerAmountToApprove({
        amountToApprove: 2_000_000n,
        sellAmount: 1_000_000n,
        isDaiLikePermit: false,
      }),
    ).toBe(2_000_000n)

    expect(
      getEoaTwapPollerAmountToApprove({
        amountToApprove: maxUint256,
        sellAmount: 1_000_000n,
        isDaiLikePermit: false,
      }),
    ).toBe(maxUint256)
  })

  it('falls back to the TWAP sell amount when vault-relayer approval reports 0', () => {
    expect(
      getEoaTwapPollerAmountToApprove({
        amountToApprove: 0n,
        sellAmount: 1_000_000n,
        isDaiLikePermit: false,
      }),
    ).toBe(1_000_000n)
  })
})
