import { Nullish } from '@cowprotocol/types'

import { getTokenAddressKey } from './tokens'

export function areAddressesEqual(a: Nullish<string>, b: Nullish<string>): boolean {
  if (!a && !b) return false
  if (!a || !b) return false

  return getTokenAddressKey(a) === getTokenAddressKey(b)
}
