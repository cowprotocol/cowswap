import React from 'react'

import { ButtonSize, ButtonPrimary } from '@cowprotocol/ui'

import { Trans } from '@lingui/macro'

import { PriceImpact } from 'legacy/hooks/usePriceImpact'
import { CloseIcon } from 'legacy/theme'

import { CurrencyArrowSeparator } from 'common/pure/CurrencyArrowSeparator'
import { CurrencyAmountPreview, CurrencyPreviewInfo } from 'common/pure/CurrencyInputPanel'

import { useIsPriceChanged } from './hooks/useIsPriceChanged'
import * as styledEl from './styled'

import { PriceUpdatedBanner } from '../PriceUpdatedBanner'

export interface TradeConfirmationProps {
  onConfirm(): void
  onDismiss(): void
  inputCurrencyInfo: CurrencyPreviewInfo
  outputCurrencyInfo: CurrencyPreviewInfo
  isConfirmDisabled: boolean
  priceImpact: PriceImpact
  title: JSX.Element | string
  buttonText?: React.ReactNode
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

  const inputAmount = inputCurrencyInfo.amount?.toExact()
  const outputAmount = outputCurrencyInfo.amount?.toExact()

  const { isPriceChanged, resetPriceChanged } = useIsPriceChanged(inputAmount, outputAmount)

  const isButtonDisabled = isConfirmDisabled || isPriceChanged

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
        {isPriceChanged && <PriceUpdatedBanner onClick={resetPriceChanged} />}
        <ButtonPrimary onClick={onConfirm} disabled={isButtonDisabled} buttonSize={ButtonSize.BIG}>
          <Trans>{buttonText}</Trans>
        </ButtonPrimary>
      </styledEl.ContentWrapper>
    </styledEl.WidgetWrapper>
  )
}
