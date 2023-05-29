import React, { ReactNode } from 'react'
import { Trans } from '@lingui/macro'
import { ButtonSize } from 'legacy/theme/enum'
import { ButtonPrimary } from 'legacy/components/Button'
import { CurrencyInfo } from 'common/pure/CurrencyInputPanel/types'
import { CurrencyAmountPreview } from 'common/pure/CurrencyInputPanel'
import * as styledEl from './styled'
import { CurrencyArrowSeparator } from 'common/pure/CurrencyArrowSeparator'
import { PriceImpact } from 'legacy/hooks/usePriceImpact'

export interface TradeConfirmationProps {
  children: JSX.Element
  inputCurrencyInfo: CurrencyInfo
  outputCurrencyInfo: CurrencyInfo
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
      <CurrencyAmountPreview
        id="input-currency-preview"
        currencyInfo={inputCurrencyInfo}
        topLabel={inputCurrencyInfo.label}
      />
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
        topLabel={outputCurrencyInfo.label}
        priceImpactParams={priceImpact}
      />
      {children}
      <ButtonPrimary onClick={onConfirm} disabled={isConfirmDisabled} buttonSize={ButtonSize.BIG}>
        <Trans>{buttonText}</Trans>
      </ButtonPrimary>
    </styledEl.ConfirmWrapper>
  )
}
