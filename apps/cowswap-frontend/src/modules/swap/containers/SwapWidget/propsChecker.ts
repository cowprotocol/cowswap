import { genericPropsChecker } from '@cowprotocol/common-utils'
import { areFractionsEqual } from '@cowprotocol/common-utils'

import { PriceImpact } from 'legacy/hooks/usePriceImpact'

import { SwapFormProps } from 'modules/swap/containers/SwapWidget/types'
import { ReceiveAmountInfo } from 'modules/swap/helpers/tradeReceiveAmount'

import { CurrencyInfo } from 'common/pure/CurrencyInputPanel/types'

function isReceiveAmountInfoEqual(prev: ReceiveAmountInfo | null, next: ReceiveAmountInfo | null): boolean {
  if (!prev || !next) {
    return prev === next
  }

  return (
    prev.feeAmount === next.feeAmount &&
    prev.amountBeforeFees === next.amountBeforeFees &&
    areFractionsEqual(prev.amountAfterFeesRaw, next.amountAfterFeesRaw) &&
    prev.amountAfterFees === next.amountAfterFees
  )
}

function isCurrencyInfoEqual(prev: CurrencyInfo, next: CurrencyInfo): boolean {
  const isCurrencyEqual =
    prev.currency && next.currency ? prev.currency.equals(next.currency) : prev.currency === next.currency
  const isBalanceEqual = areFractionsEqual(prev.balance, next.balance)
  const isFiatAmountEqual = areFractionsEqual(prev.fiatAmount, next.fiatAmount)
  const isAmountEqual = areFractionsEqual(prev.amount, next.amount)
  const isIsIndependentEqual = prev.isIndependent === next.isIndependent

  return (
    isCurrencyEqual &&
    isBalanceEqual &&
    isFiatAmountEqual &&
    isAmountEqual &&
    isIsIndependentEqual &&
    isReceiveAmountInfoEqual(prev.receiveAmountInfo, next.receiveAmountInfo)
  )
}

function isPriceImpactEqual(prev: PriceImpact, next: PriceImpact): boolean {
  return prev.loading === next.loading && areFractionsEqual(prev.priceImpact, next.priceImpact)
}

export function swapPagePropsChecker(prev: SwapFormProps, next: SwapFormProps): boolean {
  return (
    prev.allowedSlippage.equalTo(next.allowedSlippage) &&
    prev.showRecipientControls === next.showRecipientControls &&
    prev.recipient === next.recipient &&
    prev.isTradePriceUpdating === next.isTradePriceUpdating &&
    prev.allowsOffchainSigning === next.allowsOffchainSigning &&
    genericPropsChecker(prev.subsidyAndBalance, next.subsidyAndBalance) &&
    isCurrencyInfoEqual(prev.inputCurrencyInfo, next.inputCurrencyInfo) &&
    isCurrencyInfoEqual(prev.outputCurrencyInfo, next.outputCurrencyInfo) &&
    isPriceImpactEqual(prev.priceImpactParams, next.priceImpactParams)
  )
}
