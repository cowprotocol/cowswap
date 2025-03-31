import { isFractionFalsy } from '@cowprotocol/common-utils'
import { Fraction } from '@uniswap/sdk-core'

import { Nullish } from '../../../../../../libs/common-utils/src/types'

export function areFractionsTruthyAndDifferent(a: Nullish<Fraction>, b: Nullish<Fraction>): boolean {
  return !!a && !isFractionFalsy(a) && !!b && !isFractionFalsy(b) && !a.equalTo(b)
}
