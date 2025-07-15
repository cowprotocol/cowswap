import { ReactElement, ReactNode, useEffect, useRef, useState } from 'react'

import { BackButton, BannerOrientation } from '@cowprotocol/ui'

import { PriceImpact } from 'legacy/hooks/usePriceImpact'

import type { AppDataInfo } from 'modules/appData'

import { OrderHooksDetails } from 'common/containers/OrderHooksDetails'
import { CurrencyAmountPreview, CurrencyPreviewInfo } from 'common/pure/CurrencyInputPanel'
import { CustomRecipientWarningBanner } from 'common/pure/CustomRecipientWarningBanner'

import { ConfirmButton } from './ConfirmButton'
import { QuoteCountdown } from './CountDown'
import { useIsPriceChanged } from './hooks/useIsPriceChanged'
import * as styledEl from './styled'

import { NoImpactWarning } from '../../containers/NoImpactWarning'
import { useTradeConfirmState } from '../../hooks/useTradeConfirmState'
import { PriceUpdatedBanner } from '../PriceUpdatedBanner'

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

// TODO: Break down this large function into smaller functions
// TODO: Reduce function complexity by extracting logic
// eslint-disable-next-line max-lines-per-function, complexity
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

  const showRecipientWarning =
    recipient &&
    (account || ensName) &&
    ![account?.toLowerCase(), ensName?.toLowerCase()].includes(recipient.toLowerCase())

  const inputAmount = inputCurrencyInfo.amount?.toExact()
  const outputAmount = outputCurrencyInfo.amount?.toExact()

  const { isPriceChanged, resetPriceChanged } = useIsPriceChanged(inputAmount, outputAmount, forcePriceConfirmation)

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

        {showRecipientWarning && <CustomRecipientWarningBanner orientation={BannerOrientation.Horizontal} />}
        {isPriceChanged && !isPriceStatic && <PriceUpdatedBanner onClick={resetPriceChanged} />}
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
