import { AddRecipientProps } from '@cow/common/pure/AddRecipient'
import { CurrencyInfo } from '@cow/common/pure/CurrencyInputPanel/types'
import { Field } from 'state/swap/actions'
import { CurrencySelectionCallback } from '@cow/modules/trade/hooks/useOnCurrencySelection'
import { OnImportDismissCallback } from '@cow/modules/trade/hooks/useOnImportDismiss'
import { RateInfoParams } from '@cow/common/pure/RateInfo'
import { PriceImpact } from 'hooks/usePriceImpact'
import { TradeFlowContext } from '@cow/modules/limitOrders/services/tradeFlow'
import { areFractionsEqual } from '@cow/utils/areFractionsEqual'
import { genericPropsChecker } from '@cow/utils/genericPropsChecker'
import { getAddress } from '@cow/utils/getAddress'
import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

export interface LimitOrdersProps extends AddRecipientProps {
  inputCurrencyInfo: CurrencyInfo
  outputCurrencyInfo: CurrencyInfo

  isUnlocked: boolean
  isRateLoading: boolean
  allowsOffchainSigning: boolean
  isWrapOrUnwrap: boolean
  showRecipient: boolean

  recipient: string | null
  chainId: number | undefined

  onUserInput(field: Field, typedValue: string): void
  onSwitchTokens(): void
  onCurrencySelection: CurrencySelectionCallback
  onImportDismiss: OnImportDismissCallback

  rateInfoParams: RateInfoParams
  priceImpact: PriceImpact
  tradeContext: TradeFlowContext | null
  feeAmount: CurrencyAmount<Currency> | null
}

export function limitOrdersPropsChecker(a: LimitOrdersProps, b: LimitOrdersProps): boolean {
  return (
    checkCurrencyInfo(a.inputCurrencyInfo, b.inputCurrencyInfo) &&
    checkCurrencyInfo(a.outputCurrencyInfo, b.outputCurrencyInfo) &&
    a.isUnlocked === b.isUnlocked &&
    a.isRateLoading === b.isRateLoading &&
    a.allowsOffchainSigning === b.allowsOffchainSigning &&
    a.isWrapOrUnwrap === b.isWrapOrUnwrap &&
    a.showRecipient === b.showRecipient &&
    a.recipient === b.recipient &&
    a.chainId === b.chainId &&
    a.onUserInput === b.onUserInput &&
    a.onSwitchTokens === b.onSwitchTokens &&
    a.onCurrencySelection === b.onCurrencySelection &&
    a.onImportDismiss === b.onImportDismiss &&
    checkRateInfoParams(a.rateInfoParams, b.rateInfoParams) &&
    checkPriceImpact(a.priceImpact, b.priceImpact) &&
    checkTradeFlowContext(a.tradeContext, b.tradeContext) &&
    checkCurrencyAmount(a.feeAmount, b.feeAmount)
  )
}

function checkCurrencyAmount(a: CurrencyAmount<Currency> | null, b: CurrencyAmount<Currency> | null): boolean {
  if (!a || !b) return a === b

  return a.currency.equals(b.currency) && a.equalTo(b)
}

function checkCurrencyInfo(a: CurrencyInfo, b: CurrencyInfo): boolean {
  return (
    a.field === b.field &&
    a.label === b.label &&
    a.viewAmount === b.viewAmount &&
    areFractionsEqual(a.rawAmount, b.rawAmount) &&
    genericPropsChecker(a.receiveAmountInfo, b.receiveAmountInfo) &&
    getAddress(a.currency) === getAddress(b.currency) &&
    areFractionsEqual(a.balance, b.balance) &&
    areFractionsEqual(a.fiatAmount, b.fiatAmount)
  )
}

function checkRateInfoParams(a: RateInfoParams, b: RateInfoParams): boolean {
  return (
    a.chainId === b.chainId &&
    areFractionsEqual(a.inputCurrencyAmount, b.inputCurrencyAmount) &&
    areFractionsEqual(a.outputCurrencyAmount, b.outputCurrencyAmount) &&
    areFractionsEqual(a.activeRateFiatAmount, b.activeRateFiatAmount) &&
    areFractionsEqual(a.invertedActiveRateFiatAmount, b.invertedActiveRateFiatAmount)
  )
}

function checkPriceImpact(a: PriceImpact, b: PriceImpact): boolean {
  return a.error === b.error && a.loading === b.loading && areFractionsEqual(a.priceImpact, b.priceImpact)
}

function checkTradeFlowContext(a: TradeFlowContext | null, b: TradeFlowContext | null): boolean {
  if (!a || !b) return a === b

  return (
    genericPropsChecker(a.postOrderParams, b.postOrderParams) &&
    a.provider === b.provider &&
    a.settlementContract === b.settlementContract &&
    a.chainId === b.chainId &&
    a.dispatch === b.dispatch &&
    a.allowsOffchainSigning === b.allowsOffchainSigning &&
    a.isGnosisSafeWallet === b.isGnosisSafeWallet
  )
}
