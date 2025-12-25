import { Nullish } from '@cowprotocol/types'
import { Currency } from '@uniswap/sdk-core'

export function getAreBridgeCurrencies(a: Nullish<Currency>, b: Nullish<Currency>): boolean {
  return Boolean(a && b && a.chainId !== b.chainId)
}
