import { CurrencyPreview } from '@cow/common/pure/CurrencyInputPanel'
import React from 'react'
import { CurrencyInfo } from '@cow/common/pure/CurrencyInputPanel/typings'
import { Trans } from '@lingui/macro'
import { ButtonPrimary } from 'components/Button'
import { ButtonSize } from 'theme'
import * as styledEl from './styled'

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
      <ButtonPrimary onClick={onConfirm} disabled={false} buttonSize={ButtonSize.BIG}>
        <Trans>Confirm</Trans>
      </ButtonPrimary>
    </styledEl.ConfirmWrapper>
  )
}
