import React, { ReactNode } from 'react'

import { Trans } from '@lingui/macro'

import { ButtonPrimary } from 'legacy/components/Button'
import { PriceImpact } from 'legacy/hooks/usePriceImpact'
import { ButtonSize } from 'legacy/theme/enum'

import { CurrencyArrowSeparator } from 'common/pure/CurrencyArrowSeparator'
import { CurrencyAmountPreview, CurrencyPreviewInfo } from 'common/pure/CurrencyInputPanel'

import * as styledEl from './styled'

export interface TradeConfirmationProps {
  children: JSX.Element
  inputCurrencyInfo: CurrencyPreviewInfo
  outputCurrencyInfo: CurrencyPreviewInfo
  onConfirm(): void
  isConfirmDisabled: boolean
  priceImpact: PriceImpact
  buttonText?: ReactNode
}

export function TradeConfirmation(props: TradeConfirmationProps) {
  const {
    children,
    inputCurrencyInfo,
    outputCurrencyInfo,
    onConfirm,
    isConfirmDisabled,
    priceImpact,
    buttonText = 'Confirm', //
  } = props

  return (
    <styledEl.ConfirmWrapper id="trade-confirmation">
      <CurrencyAmountPreview id="input-currency-preview" currencyInfo={inputCurrencyInfo} />
      <styledEl.CurrencySeparatorBox withRecipient={false}>
        <CurrencyArrowSeparator
          withRecipient={false}
          isCollapsed={false}
          isLoading={false}
          hasSeparatorLine={true}
          onSwitchTokens={() => null}
        />
      </styledEl.CurrencySeparatorBox>
      <CurrencyAmountPreview
        id="output-currency-preview"
        currencyInfo={outputCurrencyInfo}
        priceImpactParams={priceImpact}
      />
      {children}
      <ButtonPrimary onClick={onConfirm} disabled={isConfirmDisabled} buttonSize={ButtonSize.BIG}>
        <Trans>{buttonText}</Trans>
      </ButtonPrimary>
    </styledEl.ConfirmWrapper>
  )
}
