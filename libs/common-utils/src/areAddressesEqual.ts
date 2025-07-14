import { Nullish } from '@cowprotocol/types'

export function areAddressesEqual(a: Nullish<string>, b: Nullish<string>): boolean {
  if ((a && !b) || (!a && b)) return false

  return a?.toLowerCase() === b?.toLowerCase()
}
