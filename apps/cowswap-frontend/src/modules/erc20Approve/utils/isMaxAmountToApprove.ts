import { Currency, CurrencyAmount } from '@cowprotocol/common-entities'

import { MAX_APPROVE_AMOUNT } from '../constants'

export function isMaxAmountToApprove(amountToApprove: CurrencyAmount<Currency> | null): boolean {
  return amountToApprove?.quotient.toString() === MAX_APPROVE_AMOUNT.toString()
}
