import React from 'react'
import { Trans } from '@lingui/macro'
import { ButtonSize } from 'theme'
import { Currency, CurrencyAmount } from '@uniswap/sdk-core'
import { ButtonPrimary } from 'components/Button'
import { CurrencyInfo } from '@cow/common/pure/CurrencyInputPanel/typings'
import { CurrencyPreview } from '@cow/common/pure/CurrencyInputPanel'
import { LimitOrdersDetails } from '../LimitOrdersDetails'
import { TradeFlowContext } from '../../services/tradeFlow'
import * as styledEl from './styled'

export interface LimitOrdersConfirmProps {
  tradeContext: TradeFlowContext
  activeRateFiatAmount: CurrencyAmount<Currency> | null
  activeRate: string
  inputCurrencyInfo: CurrencyInfo
  outputCurrencyInfo: CurrencyInfo
  onConfirm(): void
}

export function LimitOrdersConfirm(props: LimitOrdersConfirmProps) {
  const { tradeContext, inputCurrencyInfo, outputCurrencyInfo, onConfirm, activeRate, activeRateFiatAmount } = props

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
      <LimitOrdersDetails
        tradeContext={tradeContext}
        activeRate={activeRate}
        activeRateFiatAmount={activeRateFiatAmount}
      />
      <ButtonPrimary onClick={onConfirm} disabled={false} buttonSize={ButtonSize.BIG}>
        <Trans>Confirm</Trans>
      </ButtonPrimary>
    </styledEl.ConfirmWrapper>
  )
}
