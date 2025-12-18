import { ReactElement, ReactNode, useMemo } from 'react'

import { BackButton } from '@cowprotocol/ui'

import { t } from '@lingui/core/macro'

import { PriceImpact } from 'legacy/hooks/usePriceImpact'

import { OrderHooksDetails } from 'common/containers/OrderHooksDetails'
import { CurrencyPreviewInfo } from 'common/pure/CurrencyInputPanel'

import { ConfirmAmounts } from './ConfirmAmounts'
import { ConfirmButton } from './ConfirmButton'
import { ConfirmWarnings } from './ConfirmWarnings'
import { QuoteCountdown } from './CountDown'
import { useIsPriceChanged } from './hooks/useIsPriceChanged'
import * as styledEl from './styled'

import { NoImpactWarning } from '../../containers/NoImpactWarning'
import { CommonTradeConfirmContext } from '../../hooks/useCommonTradeConfirmContext'

import type { SigningStepState } from 'entities/trade'

export interface TradeConfirmationProps extends CommonTradeConfirmContext {
  onConfirm(): Promise<boolean | void>

  onDismiss(): void

  inputCurrencyInfo: CurrencyPreviewInfo
  outputCurrencyInfo: CurrencyPreviewInfo
  isConfirmDisabled: boolean
  priceImpact: PriceImpact
  title: ReactElement | string
  isPriceStatic?: boolean
  recipient?: string | null
  buttonText?: ReactNode
  children?: (restContent: ReactElement) => ReactElement
  confirmClickEvent?: string
}

export interface TradeConfirmationViewProps extends TradeConfirmationProps {
  hasPendingTrade: boolean
  signingStep: SigningStepState | null
  forcePriceConfirmation: boolean
}

export function TradeConfirmationView(viewProps: TradeConfirmationViewProps): ReactNode {
  const {
    onConfirm,
    onDismiss,
    isConfirmDisabled,
    title,
    buttonText,
    children,
    recipient,
    isPriceStatic,
    appData,
    confirmClickEvent,
    inputCurrencyInfo,
    outputCurrencyInfo,
    priceImpact,
    account,
    ensName,
    hasPendingTrade,
    signingStep,
    forcePriceConfirmation,
  } = viewProps

  const { isPriceChanged, resetPriceChanged } = useIsPriceChanged(
    inputCurrencyInfo.amount?.toExact(),
    outputCurrencyInfo.amount?.toExact(),
    forcePriceConfirmation,
  )

  const hookDetailsElement = useMemo(
    () =>
      appData ? (
        <OrderHooksDetails appData={appData} isTradeConfirmation>
          {(hookChildren) => hookChildren}
        </OrderHooksDetails>
      ) : null,
    [appData],
  )
  const isButtonDisabled = isConfirmDisabled || (isPriceChanged && !isPriceStatic) || hasPendingTrade

  const restContent = (
    <>
      {hookDetailsElement}
      <NoImpactWarning withoutAccepting />
    </>
  )

  return (
    <styledEl.WidgetWrapper onKeyDown={(e) => e.key === 'Escape' && onDismiss()}>
      <styledEl.Header>
        <BackButton onClick={onDismiss} />
        <styledEl.ConfirmHeaderTitle>{title}</styledEl.ConfirmHeaderTitle>
        <styledEl.HeaderRightContent>
          {hasPendingTrade || isPriceStatic ? null : <QuoteCountdown />}
        </styledEl.HeaderRightContent>
      </styledEl.Header>
      <styledEl.ContentWrapper id="trade-confirmation">
        <ConfirmAmounts
          inputCurrencyInfo={inputCurrencyInfo}
          outputCurrencyInfo={outputCurrencyInfo}
          priceImpact={priceImpact}
        />
        {children ? children(restContent) : restContent}
        <ConfirmWarnings
          account={account}
          ensName={ensName}
          recipient={recipient}
          isPriceChanged={isPriceChanged}
          isPriceStatic={isPriceStatic}
          resetPriceChanged={resetPriceChanged}
        />
        <ConfirmButton
          onConfirm={onConfirm}
          buttonText={buttonText ? buttonText : t`Confirm`}
          isButtonDisabled={isButtonDisabled}
          hasPendingTrade={hasPendingTrade}
          signingStep={signingStep}
          dataClickEvent={confirmClickEvent}
        />
      </styledEl.ContentWrapper>
    </styledEl.WidgetWrapper>
  )
}
