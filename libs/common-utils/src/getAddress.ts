import { Currency } from '@uniswap/sdk-core'

export function getAddress(currency: Currency | null | undefined): string | null {
  if (!currency || currency.isNative) {
    return null
  }

  return currency?.address || (currency as { tokenInfo?: { address?: string } })?.tokenInfo?.address || null
}
