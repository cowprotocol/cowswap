import { ReactElement, ReactNode, useEffect, useRef, useState } from 'react'

import { BackButton } from '@cowprotocol/ui'

import { PriceImpact } from 'legacy/hooks/usePriceImpact'

import type { AppDataInfo } from 'modules/appData'

import { OrderHooksDetails } from 'common/containers/OrderHooksDetails'
import { CurrencyAmountPreview, CurrencyPreviewInfo } from 'common/pure/CurrencyInputPanel'

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

export function TradeConfirmation(props: TradeConfirmationProps): ReactNode {
  const { pendingTrade, forcePriceConfirmation } = useTradeConfirmState()

  const propsRef = useRef(props)
  propsRef.current = props

  const [frozenProps, setFrozenProps] = useState<TradeConfirmationProps | null>(null)
  const hasPendingTrade = !!pendingTrade

  const {
    onConfirm,
    onDismiss,
    account,
    ensName,
    inputCurrencyInfo,
    outputCurrencyInfo,
    isConfirmDisabled,
    priceImpact,
    title,
    buttonText = 'Confirm',
    children,
    recipient,
    isPriceStatic,
    appData,
  } = frozenProps || props

  /**
   * Once user sends a transaction, we keep the confirmation content frozen
   */
  useEffect(() => {
    setFrozenProps(hasPendingTrade ? propsRef.current : null)
  }, [hasPendingTrade])

  const { isPriceChanged, resetPriceChanged } = useIsPriceChanged(
    inputCurrencyInfo.amount?.toExact(),
    outputCurrencyInfo.amount?.toExact(),
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
        {children?.(
          <>
            {hookDetailsElement}
            <NoImpactWarning withoutAccepting />
          </>,
        )}

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
          buttonText={buttonText}
          isButtonDisabled={isButtonDisabled}
          hasPendingTrade={hasPendingTrade}
        />
      </styledEl.ContentWrapper>
    </styledEl.WidgetWrapper>
  )
}
