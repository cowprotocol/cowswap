import React, { useEffect, useState } from 'react'

import { ButtonSize, ButtonPrimary } from '@cowprotocol/ui'
import { BackButton } from '@cowprotocol/ui'

import { Trans } from '@lingui/macro'
import ms from 'ms.macro'

import { useMediaQuery, upToMedium } from 'legacy/hooks/useMediaQuery'
import { PriceImpact } from 'legacy/hooks/usePriceImpact'

import { CurrencyAmountPreview, CurrencyPreviewInfo } from 'common/pure/CurrencyInputPanel'
import { BannerOrientation, CustomRecipientWarningBanner } from 'common/pure/InlineBanner/banners'

import { QuoteCountdown } from './CountDown'
import { useIsPriceChanged } from './hooks/useIsPriceChanged'
import * as styledEl from './styled'

import { CustomRecipientBanner } from '../CustomRecipientBanner'
import { PriceUpdatedBanner } from '../PriceUpdatedBanner'

const ONE_SEC = ms`1s`

export interface TradeConfirmationProps {
  onConfirm(): void
  onDismiss(): void
  account: string | undefined
  inputCurrencyInfo: CurrencyPreviewInfo
  outputCurrencyInfo: CurrencyPreviewInfo
  isConfirmDisabled: boolean
  priceImpact: PriceImpact
  title: JSX.Element | string
  refreshInterval?: number
  recipient: string | null
  buttonText?: React.ReactNode
  children?: JSX.Element
}

export function TradeConfirmation(props: TradeConfirmationProps) {
  const {
    onConfirm,
    onDismiss,
    account,
    inputCurrencyInfo,
    outputCurrencyInfo,
    isConfirmDisabled,
    priceImpact,
    title,
    refreshInterval,
    buttonText = 'Confirm',
    children,
    recipient,
  } = props

  const showRecipientWarning = recipient && account && recipient.toLowerCase() !== account.toLowerCase()
  const inputAmount = inputCurrencyInfo.amount?.toExact()
  const outputAmount = outputCurrencyInfo.amount?.toExact()

  const { isPriceChanged, resetPriceChanged } = useIsPriceChanged(inputAmount, outputAmount)

  const isButtonDisabled = isConfirmDisabled || isPriceChanged

  const [nextUpdateAt, setNextUpdateAt] = useState(refreshInterval)

  useEffect(() => {
    if (refreshInterval === undefined || nextUpdateAt === undefined) return

    const interval = setInterval(() => {
      const newValue = nextUpdateAt - ONE_SEC

      setNextUpdateAt(newValue <= 0 ? refreshInterval : newValue)
    }, ONE_SEC)

    return () => clearInterval(interval)
  }, [nextUpdateAt, refreshInterval])

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  const isUpToMedium = useMediaQuery(upToMedium)

  // Combine local onClick logic with incoming onClick
  const handleConfirmClick = () => {
    if (isUpToMedium) {
      window.scrollTo({ top: 0, left: 0 })
    }

    onConfirm()
  }

  return (
    <styledEl.WidgetWrapper onKeyDown={(e) => e.key === 'Escape' && onDismiss()}>
      <styledEl.Header>
        <BackButton onClick={onDismiss} />
        <styledEl.ConfirmHeaderTitle>{title}</styledEl.ConfirmHeaderTitle>

        {nextUpdateAt !== undefined && <QuoteCountdown nextUpdateAt={nextUpdateAt} />}
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
        {/*Banners*/}
        {isPriceChanged && <PriceUpdatedBanner onClick={resetPriceChanged} />}
        {showRecipientWarning && <CustomRecipientWarningBanner orientation={BannerOrientation.Horizontal} />}
        {!showRecipientWarning && <CustomRecipientBanner recipient={recipient} />}
        <ButtonPrimary onClick={handleConfirmClick} disabled={isButtonDisabled} buttonSize={ButtonSize.BIG}>
          <Trans>{buttonText}</Trans>
        </ButtonPrimary>
      </styledEl.ContentWrapper>
    </styledEl.WidgetWrapper>
  )
}
