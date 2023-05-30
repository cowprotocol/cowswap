import React from 'react'

import { Trans } from '@lingui/macro'

import { ButtonPrimary } from 'legacy/components/Button'
import { PriceImpact } from 'legacy/hooks/usePriceImpact'
import { CloseIcon } from 'legacy/theme'
import { ButtonSize } from 'legacy/theme/enum'

import { CurrencyArrowSeparator } from 'common/pure/CurrencyArrowSeparator'
import { CurrencyAmountPreview, CurrencyPreviewInfo } from 'common/pure/CurrencyInputPanel'

import * as styledEl from './styled'

export interface TradeConfirmationProps {
  onConfirm(): void
  onDismiss(): void
  inputCurrencyInfo: CurrencyPreviewInfo
  outputCurrencyInfo: CurrencyPreviewInfo
  isConfirmDisabled: boolean
  priceImpact: PriceImpact
  title: JSX.Element | string
  buttonText?: JSX.Element
  children?: JSX.Element
}

export function TradeConfirmation(props: TradeConfirmationProps) {
  const {
    onConfirm,
    onDismiss,
    inputCurrencyInfo,
    outputCurrencyInfo,
    isConfirmDisabled,
    priceImpact,
    title,
    buttonText = 'Confirm',
    children,
  } = props

  return (
    <styledEl.WidgetWrapper>
      <styledEl.Header>
        <styledEl.ConfirmHeaderTitle>{title}</styledEl.ConfirmHeaderTitle>
        <CloseIcon onClick={onDismiss} />
      </styledEl.Header>
      <styledEl.ContentWrapper id="trade-confirmation">
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
      </styledEl.ContentWrapper>
    </styledEl.WidgetWrapper>
  )
}
