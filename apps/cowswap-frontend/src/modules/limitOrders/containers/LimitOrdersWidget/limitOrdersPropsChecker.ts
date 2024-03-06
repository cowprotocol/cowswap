import { areFractionsEqual, genericPropsChecker, getAddress } from '@cowprotocol/common-utils'
import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

import { PriceImpact } from 'legacy/hooks/usePriceImpact'

import { TradeFlowContext } from 'modules/limitOrders/services/types'
import { LimitOrdersSettingsState } from 'modules/limitOrders/state/limitOrdersSettingsAtom'
import { TradeWidgetActions } from 'modules/trade'
import { TradeFormValidation } from 'modules/tradeFormValidation'

import { CurrencyInfo } from 'common/pure/CurrencyInputPanel/types'
import { RateInfoParams } from 'common/pure/RateInfo'

import { LimitOrdersFormState } from '../../hooks/useLimitOrdersFormState'

export interface LimitOrdersProps {
  inputCurrencyInfo: CurrencyInfo
  outputCurrencyInfo: CurrencyInfo

  isUnlocked: boolean
  isRateLoading: boolean
  showRecipient: boolean
  recipient: string | null

  rateInfoParams: RateInfoParams
  priceImpact: PriceImpact
  tradeContext: TradeFlowContext | null
  settingsState: LimitOrdersSettingsState
  feeAmount: CurrencyAmount<Currency> | null
  widgetActions: TradeWidgetActions

  localFormValidation: LimitOrdersFormState | null
  primaryFormValidation: TradeFormValidation | null
}

export function limitOrdersPropsChecker(a: LimitOrdersProps, b: LimitOrdersProps): boolean {
  return (
    checkCurrencyInfo(a.inputCurrencyInfo, b.inputCurrencyInfo) &&
    checkCurrencyInfo(a.outputCurrencyInfo, b.outputCurrencyInfo) &&
    a.isUnlocked === b.isUnlocked &&
    a.isRateLoading === b.isRateLoading &&
    a.showRecipient === b.showRecipient &&
    a.recipient === b.recipient &&
    a.widgetActions === b.widgetActions &&
    checkRateInfoParams(a.rateInfoParams, b.rateInfoParams) &&
    checkPriceImpact(a.priceImpact, b.priceImpact) &&
    checkTradeFlowContext(a.tradeContext, b.tradeContext) &&
    genericPropsChecker(a.settingsState, b.settingsState) &&
    checkCurrencyAmount(a.feeAmount, b.feeAmount) &&
    a.localFormValidation === b.localFormValidation &&
    a.primaryFormValidation === b.primaryFormValidation
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
    a.isIndependent === b.isIndependent &&
    areFractionsEqual(a.amount, b.amount) &&
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
  return a.loading === b.loading && areFractionsEqual(a.priceImpact, b.priceImpact)
}

function checkTradeFlowContext(a: TradeFlowContext | null, b: TradeFlowContext | null): boolean {
  if (!a || !b) return a === b

  return (
    genericPropsChecker(a.postOrderParams, b.postOrderParams) &&
    a.provider === b.provider &&
    a.settlementContract === b.settlementContract &&
    a.chainId === b.chainId &&
    a.dispatch === b.dispatch &&
    a.allowsOffchainSigning === b.allowsOffchainSigning
  )
}
