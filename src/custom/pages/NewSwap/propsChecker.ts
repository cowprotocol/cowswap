import { Currency, CurrencyAmount } from '@uniswap/sdk-core'
import { CurrencyInfo, NewSwapPageProps } from 'pages/NewSwap/typings'

function isCurrencyAmountEqual(prev: CurrencyAmount<Currency> | null, next: CurrencyAmount<Currency> | null): boolean {
  return prev && next ? prev.equalTo(next) : prev === next
}

function isCurrencyInfoEqual(prev: CurrencyInfo, next: CurrencyInfo): boolean {
  const isCurrencyEqual =
    prev.currency && next.currency ? prev.currency.equals(next.currency) : prev.currency === next.currency
  const isBalanceEqual = isCurrencyAmountEqual(prev.balance, next.balance)
  const isFiatAmountEqual = isCurrencyAmountEqual(prev.fiatAmount, next.fiatAmount)

  return isCurrencyEqual && isBalanceEqual && isFiatAmountEqual
}

export function swapPagePropsChecker(prev: NewSwapPageProps, next: NewSwapPageProps): boolean {
  return (
    prev.allowedSlippage.equalTo(next.allowedSlippage) &&
    prev.typedValue === next.typedValue &&
    isCurrencyInfoEqual(prev.inputCurrencyInfo, next.inputCurrencyInfo) &&
    isCurrencyInfoEqual(prev.outputCurrencyInfo, next.outputCurrencyInfo)
  )
}
