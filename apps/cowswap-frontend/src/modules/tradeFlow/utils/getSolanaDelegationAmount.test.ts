import { TokenWithLogo } from '@cowprotocol/common-const'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { CurrencyAmount } from '@cowprotocol/currency'

import { MAX_APPROVE_AMOUNT } from 'modules/erc20Approve'
import { SOLANA_MAX_APPROVE_AMOUNT } from 'modules/trade'

import { getSolanaDelegationAmount } from './getSolanaDelegationAmount'

const usdc = new TokenWithLogo(
  undefined,
  SupportedChainId.SOLANA,
  'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
  6,
  'USDC',
  'USD Coin',
)

const SELL_AMOUNT = 30_699_886n

describe('getSolanaDelegationAmount', () => {
  it('delegates the partial amount the user chose', () => {
    const chosen = CurrencyAmount.fromRawAmount(usdc, '12345')

    expect(getSolanaDelegationAmount(chosen, SELL_AMOUNT)).toBe(12345n)
  })

  it('maps an unlimited approval to u64 max, not uint256 max', () => {
    // MAX_APPROVE_AMOUNT is maxUint256 and does not fit SPL's u64 amount; passing it through would
    // overflow the approve instruction.
    const unlimited = CurrencyAmount.fromRawAmount(usdc, MAX_APPROVE_AMOUNT.toString())

    const result = getSolanaDelegationAmount(unlimited, SELL_AMOUNT)

    expect(result).toBe(SOLANA_MAX_APPROVE_AMOUNT)
    expect(result).toBeLessThan(2n ** 64n)
  })

  it('falls back to the sell amount when there is no approval amount yet', () => {
    expect(getSolanaDelegationAmount(null, SELL_AMOUNT)).toBe(SELL_AMOUNT)
  })
})
