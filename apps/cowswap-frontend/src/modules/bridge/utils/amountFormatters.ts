import { TokenWithLogo } from '@cowprotocol/common-const'
import { CurrencyAmount } from '@uniswap/sdk-core'

/**
 * Safely converts a CurrencyAmount to a string with 6 significant digits for display.
 * Returns '0' if the amount is null or undefined.
 */
export function getAmountString(amount: CurrencyAmount<TokenWithLogo> | null | undefined): string {
  return amount ? amount.toSignificant(6) : '0'
}
