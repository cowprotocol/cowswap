import { Fraction } from '@cowprotocol/common-entities'

export function areFractionsEqual(a?: Fraction | null, b?: Fraction | null): boolean {
  return a && b ? a.equalTo(b) : a === b
}
