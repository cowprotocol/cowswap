import React, { useState } from 'react'
import { Trans } from '@lingui/macro'
import { ButtonSize } from 'theme'
import { ButtonPrimary } from 'components/Button'
import { CurrencyInfo } from '@cow/common/pure/CurrencyInputPanel/types'
import { CurrencyPreview } from '@cow/common/pure/CurrencyInputPanel'
import { LimitOrdersDetails } from '../LimitOrdersDetails'
import { TradeFlowContext } from '../../services/tradeFlow'
import * as styledEl from './styled'
import { RateImpactWarning } from '@cow/modules/limitOrders/pure/RateImpactWarning'
import { LOW_RATE_THRESHOLD_PERCENT } from '@cow/modules/limitOrders/const/trade'
import { ActiveRateDisplay } from '@cow/modules/limitOrders/hooks/useActiveRateDisplay'

export interface LimitOrdersConfirmProps {
  tradeContext: TradeFlowContext
  activeRateDisplay: ActiveRateDisplay
  inputCurrencyInfo: CurrencyInfo
  outputCurrencyInfo: CurrencyInfo
  rateImpact: number
  onConfirm(): void
}

export function LimitOrdersConfirm(props: LimitOrdersConfirmProps) {
  const { tradeContext, inputCurrencyInfo, outputCurrencyInfo, onConfirm, activeRateDisplay, rateImpact } = props

  const [rateImpactAcknowledge, setRateImpactAcknowledge] = useState(false)

  const inputCurrency = inputCurrencyInfo.currency
  const isTooLowRate = rateImpact < LOW_RATE_THRESHOLD_PERCENT
  const isTradeDisabled = isTooLowRate ? !rateImpactAcknowledge : false

  return (
    <styledEl.ConfirmWrapper>
      <CurrencyPreview
        id="input-currency-preview"
        currencyInfo={inputCurrencyInfo}
        topLabel={inputCurrencyInfo.label}
      />
      <CurrencyPreview
        id="output-currency-preview"
        currencyInfo={outputCurrencyInfo}
        topLabel={outputCurrencyInfo.label}
      />
      <LimitOrdersDetails tradeContext={tradeContext} activeRateDisplay={activeRateDisplay} />
      {!!inputCurrency && (
        <RateImpactWarning
          withAcknowledge={true}
          onAcknowledgeChange={setRateImpactAcknowledge}
          rateImpact={rateImpact}
          inputCurrency={inputCurrency}
        />
      )}
      <ButtonPrimary onClick={onConfirm} disabled={isTradeDisabled} buttonSize={ButtonSize.BIG}>
        <Trans>Confirm</Trans>
      </ButtonPrimary>
    </styledEl.ConfirmWrapper>
  )
}
