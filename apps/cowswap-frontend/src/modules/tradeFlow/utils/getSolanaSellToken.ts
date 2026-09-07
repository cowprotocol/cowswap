import { TokenWithLogo, WRAPPED_NATIVE_CURRENCIES } from '@cowprotocol/common-const'
import { getIsNativeToken } from '@cowprotocol/common-utils'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import type { Currency } from '@cowprotocol/currency'

/**
 * The token the delegate step approves. Selling native SOL delegates WSOL — what the wrap step produces —
 * so both cases resolve to a real SPL mint.
 */
export function getSolanaSellToken(inputCurrency: Currency | null | undefined): TokenWithLogo | undefined {
  if (!inputCurrency) return undefined

  if (getIsNativeToken(inputCurrency)) return WRAPPED_NATIVE_CURRENCIES[SupportedChainId.SOLANA]

  return inputCurrency instanceof TokenWithLogo ? inputCurrency : undefined
}
