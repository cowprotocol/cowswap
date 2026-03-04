import { Fraction } from '@cowprotocol/common-entities'

export function isFractionFalsy(amount: Fraction | null | undefined): boolean {
  if (!amount) return true

  return amount.equalTo(0)
}
