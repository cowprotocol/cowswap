import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

import { MAX_APPROVE_AMOUNT } from '../hooks'

export function isMaxAmountToApprove(amountToApprove: CurrencyAmount<Currency> | null): boolean {
  return amountToApprove?.quotient.toString() === MAX_APPROVE_AMOUNT
}
