import { Percent } from '@uniswap/sdk-core'

import ms from 'ms.macro'

const oneDay = ms`1d` / 1000
const oneWeek = ms`1w` / 1000
const oneMonth = ms`30d` / 1000

export function isPriceProtectionNotEnough(deadline: number, slippagePercent: Percent): boolean {
  const slippage = +slippagePercent.toFixed(2)

  if (deadline <= oneDay) {
    return slippage < 10
  }

  if (deadline < oneWeek) {
    return slippage < 20
  }

  if (deadline < oneMonth) {
    return slippage < 30
  }

  return slippage < 50
}
