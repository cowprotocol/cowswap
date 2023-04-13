import React, { ReactNode } from 'react'
import { Trans } from '@lingui/macro'
import { ButtonSize } from 'theme/enum'
import { ButtonPrimary } from 'components/Button'
import { CurrencyInfo } from '@cow/common/pure/CurrencyInputPanel/types'
import { CurrencyPreview } from '@cow/common/pure/CurrencyInputPanel'
import { LimitOrdersDetails } from '../LimitOrdersDetails'
import { TradeFlowContext } from '../../services/tradeFlow'
import * as styledEl from './styled'
import { LOW_RATE_THRESHOLD_PERCENT } from '@cow/modules/limitOrders/const/trade'
import { PriceImpact } from 'hooks/usePriceImpact'
import { CurrencySeparatorBox } from '@cow/modules/limitOrders/containers/LimitOrdersWidget/styled'
import { CurrencyArrowSeparator } from '@cow/common/pure/CurrencyArrowSeparator'
import { RateInfoParams } from '@cow/common/pure/RateInfo'
import { LimitOrdersSettingsState } from '@cow/modules/limitOrders/state/limitOrdersSettingsAtom'
import { Currency, Price } from '@uniswap/sdk-core'
import { LimitRateState } from '@cow/modules/limitOrders/state/limitRateAtom'
import { PartiallyFillableOverrideDispatcherType } from '@cow/modules/limitOrders/state/partiallyFillableOverride'

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
      />
      {Warnings}
      <ButtonPrimary onClick={onConfirm} disabled={isTradeDisabled} buttonSize={ButtonSize.BIG}>
        <Trans>Confirm</Trans>
      </ButtonPrimary>
    </styledEl.ConfirmWrapper>
  )
}
