import { CurrencyInfo, NewSwapPageProps } from 'pages/NewSwap/typings'
import { PriceImpact } from 'hooks/usePriceImpact'
import { Fraction } from '@uniswap/sdk-core'
import { ReceiveAmountInfo } from 'pages/NewSwap/helpers/tradeReceiveAmount'

function isFractionEqual(prev?: Fraction | null, next?: Fraction | null): boolean {
  return prev && next ? prev.equalTo(next) : prev === next
}

function isReceiveAmountInfoEqual(prev: ReceiveAmountInfo | null, next: ReceiveAmountInfo | null): boolean {
  if (!prev || !next) {
    return prev === next
  }

  return (
    prev.feeAmount === next.feeAmount &&
    prev.amountBeforeFees === next.amountBeforeFees &&
    prev.amountAfterFees === next.amountAfterFees
  )
}

function isCurrencyInfoEqual(prev: CurrencyInfo, next: CurrencyInfo): boolean {
  const isCurrencyEqual =
    prev.currency && next.currency ? prev.currency.equals(next.currency) : prev.currency === next.currency
  const isBalanceEqual = isFractionEqual(prev.balance, next.balance)
  const isFiatAmountEqual = isFractionEqual(prev.fiatAmount, next.fiatAmount)
  const isViewAmountEqual = prev.viewAmount === next.viewAmount

  return (
    isCurrencyEqual &&
    isBalanceEqual &&
    isFiatAmountEqual &&
    isViewAmountEqual &&
    isReceiveAmountInfoEqual(prev.receiveAmountInfo, next.receiveAmountInfo)
  )
}

function isPriceImpactEqual(prev: PriceImpact, next: PriceImpact): boolean {
  return (
    prev.loading === next.loading && prev.error === next.error && isFractionEqual(prev.priceImpact, next.priceImpact)
  )
}

export function swapPagePropsChecker(prev: NewSwapPageProps, next: NewSwapPageProps): boolean {
  return (
    prev.allowedSlippage.equalTo(next.allowedSlippage) &&
    isCurrencyInfoEqual(prev.inputCurrencyInfo, next.inputCurrencyInfo) &&
    isCurrencyInfoEqual(prev.outputCurrencyInfo, next.outputCurrencyInfo) &&
    isPriceImpactEqual(prev.priceImpactParams, next.priceImpactParams)
  )
}
