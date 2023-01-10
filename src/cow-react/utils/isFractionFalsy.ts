import { Fraction } from '@uniswap/sdk-core'

export function isFractionFalsy(amount: Fraction | null | undefined): boolean {
  if (!amount) return true

  return amount.equalTo(0)
}
