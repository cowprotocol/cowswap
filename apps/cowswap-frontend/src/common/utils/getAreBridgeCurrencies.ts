import { Currency } from '@cowprotocol/currency'
import { Nullish } from '@cowprotocol/types'

export function getAreBridgeCurrencies(a: Nullish<Currency>, b: Nullish<Currency>): boolean {
  return Boolean(a && b && a.chainId !== b.chainId)
}
