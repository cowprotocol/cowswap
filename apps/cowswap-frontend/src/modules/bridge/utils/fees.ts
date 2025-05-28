import { TokenWithLogo } from '@cowprotocol/common-const'
import { UI } from '@cowprotocol/ui'
import { CurrencyAmount } from '@uniswap/sdk-core'

import { BridgeFeeType } from '../types'

/**
 * Checks if a bridge fee is free (0 or FREE)
 */
export function isFreeSwapFee(fee: CurrencyAmount<TokenWithLogo> | BridgeFeeType): boolean {
  if (fee === BridgeFeeType.FREE) {
    return true
  }
  if (fee instanceof CurrencyAmount) {
    return fee.equalTo(0)
  }
  // If fee is not BridgeFeeType.FREE and not a zero CurrencyAmount,
  // it's not considered free according to its defined type as it should be enforced by TypeScript that 'fee' conforms to
  // CurrencyAmount<TokenWithLogo> | BridgeFeeType.
  return false
}

/**
 * Returns the appropriate text color for a fee
 */
export function getFeeTextColor(fee: CurrencyAmount<TokenWithLogo> | BridgeFeeType): string | undefined {
  if (isFreeSwapFee(fee)) {
    return `var(${UI.COLOR_GREEN})`
  }
  return undefined
}
