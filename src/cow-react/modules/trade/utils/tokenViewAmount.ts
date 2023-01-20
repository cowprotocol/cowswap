import { Currency, CurrencyAmount } from '@uniswap/sdk-core'
import { AMOUNT_PRECISION } from 'constants/index'

export function tokenViewAmount(amount: CurrencyAmount<Currency> | undefined | null): string {
  return amount?.toFixed(AMOUNT_PRECISION) || ''
}
