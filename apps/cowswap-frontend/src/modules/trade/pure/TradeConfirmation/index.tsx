import React from 'react'

import { useTimeAgo } from '@cowprotocol/common-hooks'
import { ButtonSize, ButtonPrimary } from '@cowprotocol/ui'
import { BackButton } from '@cowprotocol/ui'

import { Trans } from '@lingui/macro'

import { PriceImpact } from 'legacy/hooks/usePriceImpact'

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
  quoteValidTo?: number
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
    quoteValidTo,
    buttonText = 'Confirm',
    children,
  } = props

  const inputAmount = inputCurrencyInfo.amount?.toExact()
  const outputAmount = outputCurrencyInfo.amount?.toExact()

  const { isPriceChanged, resetPriceChanged } = useIsPriceChanged(inputAmount, outputAmount)

  const isButtonDisabled = isConfirmDisabled || isPriceChanged

  const quoteExpirationTimeAgo = useTimeAgo((quoteValidTo || 0) * 1000, 1000)

  return (
    <styledEl.WidgetWrapper onKeyDown={(e) => e.key === 'Escape' && onDismiss()}>
      <styledEl.Header>
        <BackButton onClick={onDismiss} />
        <styledEl.ConfirmHeaderTitle>{title}</styledEl.ConfirmHeaderTitle>

        <styledEl.QuoteCountdown>
          Quote expires <b>{quoteExpirationTimeAgo}</b>
        </styledEl.QuoteCountdown>
      </styledEl.Header>
      <styledEl.ContentWrapper id="trade-confirmation">
        <styledEl.AmountsPreviewContainer>
          <CurrencyAmountPreview id="input-currency-preview" currencyInfo={inputCurrencyInfo} />
          <styledEl.SeparatorWrapper>
            <styledEl.AmountsSeparator />
          </styledEl.SeparatorWrapper>
          <CurrencyAmountPreview
            id="output-currency-preview"
            currencyInfo={outputCurrencyInfo}
            priceImpactParams={priceImpact}
          />
        </styledEl.AmountsPreviewContainer>
        {children}
        {isPriceChanged && <PriceUpdatedBanner onClick={resetPriceChanged} />}
        <ButtonPrimary onClick={onConfirm} disabled={isButtonDisabled} buttonSize={ButtonSize.BIG}>
          <Trans>{buttonText}</Trans>
        </ButtonPrimary>
      </styledEl.ContentWrapper>
    </styledEl.WidgetWrapper>
  )
}
