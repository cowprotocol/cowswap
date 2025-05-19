import { UI } from '@cowprotocol/ui'

import { BridgeFeeType } from '../types'

/**
 * Checks if a bridge fee is free (0 or FREE)
 */
export function isFreeSwapFee(fee: string | BridgeFeeType): boolean {
  return fee === BridgeFeeType.FREE || fee === 'FREE' || fee === '0' || fee === '0.0'
}

/**
 * Returns the appropriate text color for a fee
 */
export function getFeeTextColor(fee: string | BridgeFeeType): string | undefined {
  if (isFreeSwapFee(fee)) {
    return `var(${UI.COLOR_GREEN})`
  }
  return undefined
}
