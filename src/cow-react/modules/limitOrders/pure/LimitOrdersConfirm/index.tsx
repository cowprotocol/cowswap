import React, { ReactNode } from 'react'
import { Trans } from '@lingui/macro'
import { ButtonSize } from 'theme'
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
  onConfirm(): void
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
  } = props

  const isTooLowRate = rateImpact < LOW_RATE_THRESHOLD_PERCENT
  const isTradeDisabled = isTooLowRate ? !warningsAccepted : false

  return (
    <styledEl.ConfirmWrapper>
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
      <LimitOrdersDetails tradeContext={tradeContext} rateInfoParams={rateInfoParams} settingsState={settingsState} />
      {Warnings}
      <ButtonPrimary onClick={onConfirm} disabled={isTradeDisabled} buttonSize={ButtonSize.BIG}>
        <Trans>Confirm</Trans>
      </ButtonPrimary>
    </styledEl.ConfirmWrapper>
  )
}
