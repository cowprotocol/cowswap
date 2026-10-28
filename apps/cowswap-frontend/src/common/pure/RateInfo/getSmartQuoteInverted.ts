import { areAddressesEqual } from '@cowprotocol/cow-sdk'

export function getSmartQuoteInverted(
  quoteAddress: string | undefined,
  inputAddress: string | undefined,
  isNativeInvolved: boolean,
): boolean | null {
  if (!quoteAddress || !inputAddress) return null

  if (isNativeInvolved) return false

  return !areAddressesEqual(quoteAddress, inputAddress)
}
