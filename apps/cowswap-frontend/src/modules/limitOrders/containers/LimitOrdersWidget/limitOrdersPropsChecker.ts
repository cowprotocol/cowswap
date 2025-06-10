import { areFractionsEqual, genericPropsChecker, getAddress } from '@cowprotocol/common-utils'
import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

import { PriceImpact } from 'legacy/hooks/usePriceImpact'

import { LimitOrdersSettingsState } from 'modules/limitOrders/state/limitOrdersSettingsAtom'
import { TradeWidgetActions } from 'modules/trade'

import { CurrencyInfo } from 'common/pure/CurrencyInputPanel/types'
import { RateInfoParams } from 'common/pure/RateInfo'

export interface LimitOrdersProps {
  inputCurrencyInfo: CurrencyInfo
  outputCurrencyInfo: CurrencyInfo

  isUnlocked: boolean
  isRateLoading: boolean
  showRecipient: boolean
  recipient?: string | null

  rateInfoParams: RateInfoParams
  priceImpact: PriceImpact
  settingsState: LimitOrdersSettingsState
  feeAmount: CurrencyAmount<Currency> | null
  widgetActions: TradeWidgetActions
}

// TODO: Reduce function complexity by extracting logic
// eslint-disable-next-line complexity
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
    genericPropsChecker(a.settingsState, b.settingsState) &&
    areFractionsEqual(a.feeAmount, b.feeAmount)
  )
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
