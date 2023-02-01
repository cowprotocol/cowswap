import { Fraction } from '@uniswap/sdk-core'
import { AMOUNT_PRECISION } from 'constants/index'
import { Nullish } from '@cow/types'

export function tokenViewAmount(amount: Nullish<Fraction>): string {
  return amount?.toSignificant(AMOUNT_PRECISION) || ''
}
