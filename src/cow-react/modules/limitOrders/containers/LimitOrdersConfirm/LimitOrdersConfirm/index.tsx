import React from 'react'
import { Trans } from '@lingui/macro'
import { ButtonSize } from 'theme'
import { CurrencyInfo } from '@cow/common/pure/CurrencyInputPanel/typings'
import { CurrencyPreview } from '@cow/common/pure/CurrencyInputPanel'
import { ButtonPrimary } from 'components/Button'
import * as styledEl from './styled'
import { LimitOrdersDetails } from '../LimitOrdersDetails'

export interface LimitOrdersConfirmProps {
  inputCurrencyInfo: CurrencyInfo
  outputCurrencyInfo: CurrencyInfo
  onConfirm(): void
}

export function LimitOrdersConfirm(props: LimitOrdersConfirmProps) {
  const { inputCurrencyInfo, outputCurrencyInfo, onConfirm } = props

  return (
    <styledEl.ConfirmWrapper>
      <CurrencyPreview id="input-currency-preview" currencyInfo={inputCurrencyInfo} topLabel={'You sell'} />
      <CurrencyPreview
        id="output-currency-preview"
        currencyInfo={outputCurrencyInfo}
        topLabel={'Your receive at least'}
      />
      <LimitOrdersDetails a={1} />
      <ButtonPrimary onClick={onConfirm} disabled={false} buttonSize={ButtonSize.BIG}>
        <Trans>Confirm</Trans>
      </ButtonPrimary>
    </styledEl.ConfirmWrapper>
  )
}
