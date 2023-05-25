import React, { ReactNode } from 'react'
import { Trans } from '@lingui/macro'
import { ButtonSize } from 'legacy/theme/enum'
import { ButtonPrimary } from 'legacy/components/Button'
import { CurrencyInfo } from 'common/pure/CurrencyInputPanel/types'
import { CurrencyPreview } from 'common/pure/CurrencyInputPanel'
import { LimitOrdersDetails } from '../LimitOrdersDetails'
import { TradeFlowContext } from '../../services/types'
import * as styledEl from './styled'
import { LOW_RATE_THRESHOLD_PERCENT } from 'modules/limitOrders/const/trade'
import { PriceImpact } from 'legacy/hooks/usePriceImpact'
import { CurrencySeparatorBox } from 'modules/limitOrders/containers/LimitOrdersWidget/styled'
import { CurrencyArrowSeparator } from 'common/pure/CurrencyArrowSeparator'
import { RateInfoParams } from 'common/pure/RateInfo'
import { LimitOrdersSettingsState } from 'modules/limitOrders/state/limitOrdersSettingsAtom'
import { Currency, Price } from '@uniswap/sdk-core'
import { LimitRateState } from 'modules/limitOrders/state/limitRateAtom'
import { PartiallyFillableOverrideDispatcherType } from 'modules/limitOrders/state/partiallyFillableOverride'

export interface LimitOrdersConfirmProps {
  tradeContext: TradeFlowContext
  rateInfoParams: RateInfoParams
  inputCurrencyInfo: CurrencyInfo
  outputCurrencyInfo: CurrencyInfo
  settingsState: LimitOrdersSettingsState
  rateImpact: number
  priceImpact: PriceImpact
  warningsAccepted: boolean
  Warnings: ReactNode
  executionPrice: Price<Currency, Currency> | null
  limitRateState: LimitRateState
  onConfirm(): void
  partiallyFillableOverride: PartiallyFillableOverrideDispatcherType
  featurePartialFillsEnabled: boolean
  buttonText?: ReactNode
}

export function LimitOrdersConfirm(props: LimitOrdersConfirmProps) {
  const {
    tradeContext,
    inputCurrencyInfo,
    outputCurrencyInfo,
    onConfirm,
    rateInfoParams,
    rateImpact,
    Warnings,
    warningsAccepted,
    priceImpact,
    settingsState,
    executionPrice,
    limitRateState,
    partiallyFillableOverride,
    featurePartialFillsEnabled,
    buttonText,
  } = props

  const isTooLowRate = rateImpact < LOW_RATE_THRESHOLD_PERCENT
  const isTradeDisabled = isTooLowRate ? !warningsAccepted : false

  return (
    <styledEl.ConfirmWrapper id="limit-orders-confirm">
      <CurrencyPreview
        id="input-currency-preview"
        currencyInfo={inputCurrencyInfo}
        topLabel={inputCurrencyInfo.label}
      />
      <CurrencySeparatorBox withRecipient={false}>
        <CurrencyArrowSeparator
          withRecipient={false}
          isCollapsed={false}
          isLoading={false}
          hasSeparatorLine={true}
          onSwitchTokens={() => null}
        />
      </CurrencySeparatorBox>
      <CurrencyPreview
        id="output-currency-preview"
        currencyInfo={outputCurrencyInfo}
        topLabel={outputCurrencyInfo.label}
        priceImpactParams={priceImpact}
      />
      <LimitOrdersDetails
        limitRateState={limitRateState}
        tradeContext={tradeContext}
        rateInfoParams={rateInfoParams}
        settingsState={settingsState}
        executionPrice={executionPrice}
        partiallyFillableOverride={partiallyFillableOverride}
        featurePartialFillsEnabled={featurePartialFillsEnabled}
      />
      {Warnings}
      <ButtonPrimary onClick={onConfirm} disabled={isTradeDisabled} buttonSize={ButtonSize.BIG}>
        <Trans>{buttonText || 'Confirm'}</Trans>
      </ButtonPrimary>
    </styledEl.ConfirmWrapper>
  )
}
