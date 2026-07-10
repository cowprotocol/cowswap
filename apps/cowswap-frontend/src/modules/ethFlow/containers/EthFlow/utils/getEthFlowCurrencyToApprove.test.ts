import { CurrencyAmount, Token } from '@cowprotocol/currency'

import { getEthFlowCurrencyToApprove } from './getEthFlowCurrencyToApprove'

describe('getEthFlowCurrencyToApprove', () => {
  const wrappedNative = new Token(1, '0x1111111111111111111111111111111111111111', 18, 'WETH', 'Wrapped Ether')
  const otherToken = new Token(1, '0x2222222222222222222222222222222222222222', 18, 'TEST', 'Test Token')

  const wrappedAmount = CurrencyAmount.fromRawAmount(wrappedNative, '100')
  const sameCurrencyAmountSetByUser = CurrencyAmount.fromRawAmount(wrappedNative, '25')
  const staleAmountSetByUser = CurrencyAmount.fromRawAmount(otherToken, '25')

  it('returns undefined when partial approval is not selected', () => {
    expect(
      getEthFlowCurrencyToApprove({
        amountSetByUser: sameCurrencyAmountSetByUser,
        isPartialApproveSelectedByUser: false,
        wrappedAmount,
      }),
    ).toBeUndefined()
  })

  it('uses the current wrapped amount when the user has not set a custom amount', () => {
    expect(
      getEthFlowCurrencyToApprove({
        amountSetByUser: undefined,
        isPartialApproveSelectedByUser: true,
        wrappedAmount,
      }),
    ).toBe(wrappedAmount)
  })

  it('uses the user amount when it belongs to the current wrapped token', () => {
    expect(
      getEthFlowCurrencyToApprove({
        amountSetByUser: sameCurrencyAmountSetByUser,
        isPartialApproveSelectedByUser: true,
        wrappedAmount,
      }),
    ).toBe(sameCurrencyAmountSetByUser)
  })

  it('ignores a stale user amount from a different token', () => {
    expect(
      getEthFlowCurrencyToApprove({
        amountSetByUser: staleAmountSetByUser,
        isPartialApproveSelectedByUser: true,
        wrappedAmount,
      }),
    ).toBe(wrappedAmount)
  })
})
