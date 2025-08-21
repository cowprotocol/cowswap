import { ReactElement, ReactNode, useEffect, useRef, useState } from 'react'

import { BackButton } from '@cowprotocol/ui'

import { t } from '@lingui/core/macro'
import { useSigningStep } from 'entities/trade'

import { PriceImpact } from 'legacy/hooks/usePriceImpact'

import type { AppDataInfo } from 'modules/appData'

import { OrderHooksDetails } from 'common/containers/OrderHooksDetails'
import { CurrencyPreviewInfo } from 'common/pure/CurrencyInputPanel'

import { ConfirmAmounts } from './ConfirmAmounts'
import { ConfirmButton } from './ConfirmButton'
import { ConfirmWarnings } from './ConfirmWarnings'
import { QuoteCountdown } from './CountDown'
import { useIsPriceChanged } from './hooks/useIsPriceChanged'
import * as styledEl from './styled'

import { NoImpactWarning } from '../../containers/NoImpactWarning'
import { useTradeConfirmState } from '../../hooks/useTradeConfirmState'

export interface TradeConfirmationProps {
  onConfirm(): Promise<void | false>

  onDismiss(): void

  account: string | undefined
  ensName: string | undefined
  appData?: string | AppDataInfo
  inputCurrencyInfo: CurrencyPreviewInfo
  outputCurrencyInfo: CurrencyPreviewInfo
  isConfirmDisabled: boolean
  priceImpact: PriceImpact
  title: ReactElement | string
  isPriceStatic?: boolean
  recipient?: string | null
  buttonText?: ReactNode
  children?: (restContent: ReactElement) => ReactElement
}

export function TradeConfirmation(_props: TradeConfirmationProps): ReactNode {
  const { pendingTrade, forcePriceConfirmation } = useTradeConfirmState()
  const signingStep = useSigningStep()

  const propsRef = useRef(_props)
  propsRef.current = _props

  const [frozenProps, setFrozenProps] = useState<TradeConfirmationProps | null>(null)
  const hasPendingTrade = !!pendingTrade

  const props = frozenProps || _props
  const {
    onConfirm,
    onDismiss,
    isConfirmDisabled,
    title,
    buttonText = t`Confirm`,
    children,
    recipient,
    isPriceStatic,
    appData,
  } = props

  /**
   * Once user sends a transaction, we keep the confirmation content frozen
   */
  useEffect(() => {
    setFrozenProps(hasPendingTrade ? propsRef.current : null)
  }, [hasPendingTrade])

  const { isPriceChanged, resetPriceChanged } = useIsPriceChanged(
    props.inputCurrencyInfo.amount?.toExact(),
    props.outputCurrencyInfo.amount?.toExact(),
    forcePriceConfirmation,
  )

  const isButtonDisabled = isConfirmDisabled || (isPriceChanged && !isPriceStatic) || hasPendingTrade

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  const hookDetailsElement = (
    <>
      {appData && (
        <OrderHooksDetails appData={appData} isTradeConfirmation>
          {(hookChildren) => hookChildren}
        </OrderHooksDetails>
      )}
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
          inputCurrencyInfo={props.inputCurrencyInfo}
          outputCurrencyInfo={props.outputCurrencyInfo}
          priceImpact={props.priceImpact}
        />
        {children?.(
          <>
            {hookDetailsElement}
            <NoImpactWarning withoutAccepting />
          </>,
        )}

        <ConfirmWarnings
          account={props.account}
          ensName={props.ensName}
          recipient={recipient}
          isPriceChanged={isPriceChanged}
          isPriceStatic={isPriceStatic}
          resetPriceChanged={resetPriceChanged}
        />

        <ConfirmButton
          onConfirm={onConfirm}
          buttonText={buttonText}
          isButtonDisabled={isButtonDisabled}
          hasPendingTrade={hasPendingTrade}
          signingStep={signingStep}
        />
      </styledEl.ContentWrapper>
    </styledEl.WidgetWrapper>
  )
}
