import React, { useEffect, useState } from 'react'

import { ButtonSize, ButtonPrimary } from '@cowprotocol/ui'
import { BackButton } from '@cowprotocol/ui'

import { Trans } from '@lingui/macro'
import ms from 'ms.macro'

import { PriceImpact } from 'legacy/hooks/usePriceImpact'

import { CurrencyAmountPreview, CurrencyPreviewInfo } from 'common/pure/CurrencyInputPanel'

import { useIsPriceChanged } from './hooks/useIsPriceChanged'
import * as styledEl from './styled'

import { PriceUpdatedBanner } from '../PriceUpdatedBanner'

const ONE_SEC = ms`1s`

export interface TradeConfirmationProps {
  onConfirm(): void
  onDismiss(): void
  inputCurrencyInfo: CurrencyPreviewInfo
  outputCurrencyInfo: CurrencyPreviewInfo
  isConfirmDisabled: boolean
  priceImpact: PriceImpact
  title: JSX.Element | string
  refreshInterval: number
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
    refreshInterval,
    buttonText = 'Confirm',
    children,
  } = props

  const inputAmount = inputCurrencyInfo.amount?.toExact()
  const outputAmount = outputCurrencyInfo.amount?.toExact()

  const { isPriceChanged, resetPriceChanged } = useIsPriceChanged(inputAmount, outputAmount)

  const isButtonDisabled = isConfirmDisabled || isPriceChanged

  const [nextUpdateAt, setNextUpdateAt] = useState(refreshInterval)

  useEffect(() => {
    const interval = setInterval(() => {
      const newValue = nextUpdateAt - ONE_SEC

      setNextUpdateAt(newValue <= 0 ? refreshInterval : newValue)
    }, ONE_SEC)

    return () => clearInterval(interval)
  }, [nextUpdateAt, refreshInterval])

  return (
    <styledEl.WidgetWrapper onKeyDown={(e) => e.key === 'Escape' && onDismiss()}>
      <styledEl.Header>
        <BackButton onClick={onDismiss} />
        <styledEl.ConfirmHeaderTitle>{title}</styledEl.ConfirmHeaderTitle>

        <styledEl.QuoteCountdown>
          Quote refresh in <b>{Math.ceil(nextUpdateAt / 1000)} sec</b>
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
