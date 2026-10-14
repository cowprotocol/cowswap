import { NATIVE_CURRENCIES } from '@cowprotocol/common-const'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { CurrencyAmount } from '@cowprotocol/currency'

import { maxAmountSpend } from './maxAmountSpend'

const ONE_SOL = 10n ** 9n

describe('maxAmountSpend', () => {
  describe('Solana', () => {
    const SOL = NATIVE_CURRENCIES[SupportedChainId.SOLANA]

    it('reserves 0.01 SOL for fees and ATA rent', () => {
      const balance = CurrencyAmount.fromRawAmount(SOL, ONE_SOL)

      const result = maxAmountSpend(balance)

      // 1 SOL - 0.01 SOL
      expect(result?.quotient).toBe(990_000_000n)
    })

    it('reserves the exact live overhead instead of the static fallback when the caller knows it', () => {
      const balance = CurrencyAmount.fromRawAmount(SOL, ONE_SOL)

      const result = maxAmountSpend(balance, false, 5_623_480n)

      expect(result?.quotient).toBe(ONE_SOL - 5_623_480n)
    })

    it('returns zero when the live overhead exceeds the balance', () => {
      const balance = CurrencyAmount.fromRawAmount(SOL, 1_000_000n)

      const result = maxAmountSpend(balance, false, 5_623_480n)

      expect(result?.quotient).toBe(0n)
    })
  })
})
