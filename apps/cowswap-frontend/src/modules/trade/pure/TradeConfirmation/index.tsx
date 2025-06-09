import { ReactElement, useEffect, useRef, useState } from 'react'

import {
  BackButton,
  BannerOrientation,
  ButtonPrimary,
  ButtonSize,
  CenteredDots,
  LongLoadText,
  ProductLogoLoader,
} from '@cowprotocol/ui'

import { Trans } from '@lingui/macro'

import { upToMedium, useMediaQuery } from 'legacy/hooks/useMediaQuery'
import { PriceImpact } from 'legacy/hooks/usePriceImpact'

import type { AppDataInfo } from 'modules/appData'

import { OrderHooksDetails } from 'common/containers/OrderHooksDetails'
import { CurrencyAmountPreview, CurrencyPreviewInfo } from 'common/pure/CurrencyInputPanel'
import { CustomRecipientWarningBanner } from 'common/pure/CustomRecipientWarningBanner'

import { QuoteCountdown } from './CountDown'
import { useIsPriceChanged } from './hooks/useIsPriceChanged'
import * as styledEl from './styled'

import { NoImpactWarning } from '../../containers/NoImpactWarning'
import { useTradeConfirmState } from '../../hooks/useTradeConfirmState'
import { PriceUpdatedBanner } from '../PriceUpdatedBanner'

export interface TradeConfirmationProps {
  onConfirm(): void

  onDismiss(): void

  account: string | undefined
  ensName: string | undefined
  appData?: string | AppDataInfo
  inputCurrencyInfo: CurrencyPreviewInfo
  outputCurrencyInfo: CurrencyPreviewInfo
  isConfirmDisabled: boolean
  priceImpact: PriceImpact
  title: ReactElement | string
  refreshInterval?: number
  isPriceStatic?: boolean
  recipient?: string | null
  buttonText?: React.ReactNode
  children?: (restContent: ReactElement) => ReactElement
  isQuoteLoading?: boolean
}

function useTradeConfirmationState(props: TradeConfirmationProps): {
  currentProps: TradeConfirmationProps
  hasPendingTrade: boolean
  isConfirmClicked: boolean
  setIsConfirmClicked: (value: boolean) => void
  forcePriceConfirmation: boolean
} {
  const { pendingTrade, forcePriceConfirmation } = useTradeConfirmState()
  const propsRef = useRef(props)
  propsRef.current = props

  const [frozenProps, setFrozenProps] = useState<TradeConfirmationProps | null>(null)
  const hasPendingTrade = !!pendingTrade
  const [isConfirmClicked, setIsConfirmClicked] = useState(false)

  const currentProps = frozenProps || props

  /**
   * Once user sends a transaction, we keep the confirmation content frozen
   */
  useEffect(() => {
    setFrozenProps(hasPendingTrade ? propsRef.current : null)
    if (!hasPendingTrade) {
      setIsConfirmClicked(false)
    }
  }, [hasPendingTrade])

  return {
    currentProps,
    hasPendingTrade,
    isConfirmClicked,
    setIsConfirmClicked,
    forcePriceConfirmation,
  }
}

function useRecipientWarning(recipient?: string | null, account?: string, ensName?: string): boolean {
  return !!(
    recipient &&
    (account || ensName) &&
    ![account?.toLowerCase(), ensName?.toLowerCase()].includes(recipient.toLowerCase())
  )
}

function useTradeConfirmationLogic(
  currentProps: TradeConfirmationProps,
  hasPendingTrade: boolean,
  isConfirmClicked: boolean,
  forcePriceConfirmation: boolean,
): {
  showRecipientWarning: boolean
  isPriceChanged: boolean
  resetPriceChanged: () => void
  isButtonDisabled: boolean
  isLoadingState: boolean
} {
  const { inputCurrencyInfo, outputCurrencyInfo, isConfirmDisabled, isPriceStatic, account, ensName, recipient } =
    currentProps

  const showRecipientWarning = useRecipientWarning(recipient, account, ensName)
  const inputAmount = inputCurrencyInfo.amount?.toExact()
  const outputAmount = outputCurrencyInfo.amount?.toExact()
  const { isPriceChanged, resetPriceChanged } = useIsPriceChanged(inputAmount, outputAmount, forcePriceConfirmation)
  const isButtonDisabled =
    isConfirmDisabled || (isPriceChanged && !isPriceStatic) || hasPendingTrade || isConfirmClicked
  // Check if we're in a loading state without valid currency info
  const isLoadingState = !inputCurrencyInfo.amount || !outputCurrencyInfo.amount

  return {
    showRecipientWarning,
    isPriceChanged,
    resetPriceChanged,
    isButtonDisabled,
    isLoadingState,
  }
}

function TradeConfirmationHeader({
  title,
  onDismiss,
  hasPendingTrade,
  isQuoteLoading,
  refreshInterval,
}: {
  title: ReactElement | string
  onDismiss: () => void
  hasPendingTrade: boolean
  isQuoteLoading: boolean
  refreshInterval?: number
}): ReactElement {
  return (
    <styledEl.Header>
      <BackButton onClick={onDismiss} />
      <styledEl.ConfirmHeaderTitle>{title}</styledEl.ConfirmHeaderTitle>
      <styledEl.HeaderRightContent>
        {hasPendingTrade || isQuoteLoading ? null : <QuoteCountdown refreshInterval={refreshInterval} />}
      </styledEl.HeaderRightContent>
    </styledEl.Header>
  )
}

function TradeAmountsPreview({
  inputCurrencyInfo,
  outputCurrencyInfo,
  priceImpact,
}: {
  inputCurrencyInfo: CurrencyPreviewInfo
  outputCurrencyInfo: CurrencyPreviewInfo
  priceImpact: PriceImpact
}): ReactElement {
  return (
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
  )
}

function TradeWarningsSection({
  showRecipientWarning,
  isPriceChanged,
  isPriceStatic,
  resetPriceChanged,
}: {
  showRecipientWarning: boolean
  isPriceChanged: boolean
  isPriceStatic?: boolean
  resetPriceChanged: () => void
}): ReactElement {
  return (
    <>
      {showRecipientWarning && <CustomRecipientWarningBanner orientation={BannerOrientation.Horizontal} />}
      {isPriceChanged && !isPriceStatic && <PriceUpdatedBanner onClick={resetPriceChanged} />}
    </>
  )
}

function TradeHookDetails({ appData }: { appData?: string | AppDataInfo }): ReactElement {
  return (
    <>
      {appData && (
        <OrderHooksDetails appData={appData} isTradeConfirmation>
          {(hookChildren) => hookChildren}
        </OrderHooksDetails>
      )}
    </>
  )
}

function TradeConfirmationContent({
  isLoadingState,
  inputCurrencyInfo,
  outputCurrencyInfo,
  priceImpact,
  children,
  appData,
  showRecipientWarning,
  isPriceChanged,
  isPriceStatic,
  resetPriceChanged,
}: {
  isLoadingState: boolean
  inputCurrencyInfo: CurrencyPreviewInfo
  outputCurrencyInfo: CurrencyPreviewInfo
  priceImpact: PriceImpact
  children?: (restContent: ReactElement) => ReactElement
  appData?: string | AppDataInfo
  showRecipientWarning: boolean
  isPriceChanged: boolean
  isPriceStatic?: boolean
  resetPriceChanged: () => void
}): ReactElement {
  if (isLoadingState) {
    return <ProductLogoLoader text="Loading quote" logoHeight={42} />
  }

  return (
    <>
      <TradeAmountsPreview
        inputCurrencyInfo={inputCurrencyInfo}
        outputCurrencyInfo={outputCurrencyInfo}
        priceImpact={priceImpact}
      />
      {children?.(
        <>
          <TradeHookDetails appData={appData} />
          <NoImpactWarning withoutAccepting />
        </>,
      )}
      <TradeWarningsSection
        showRecipientWarning={showRecipientWarning}
        isPriceChanged={isPriceChanged}
        isPriceStatic={isPriceStatic}
        resetPriceChanged={resetPriceChanged}
      />
    </>
  )
}

function TradeConfirmationButton({
  handleConfirmClick,
  isButtonDisabled,
  isLoadingState,
  hasPendingTrade,
  isConfirmClicked,
  buttonText,
}: {
  handleConfirmClick: () => void
  isButtonDisabled: boolean
  isLoadingState: boolean
  hasPendingTrade: boolean
  isConfirmClicked: boolean
  buttonText?: React.ReactNode
}): ReactElement {
  return (
    <ButtonPrimary
      onClick={handleConfirmClick}
      disabled={isButtonDisabled || isLoadingState}
      buttonSize={ButtonSize.BIG}
    >
      {hasPendingTrade || isConfirmClicked ? (
        <LongLoadText fontSize={15} fontWeight={500}>
          Confirm with your wallet <CenteredDots smaller />
        </LongLoadText>
      ) : isLoadingState ? (
        <LongLoadText fontSize={15} fontWeight={500}>
          Loading <CenteredDots smaller />
        </LongLoadText>
      ) : (
        <Trans>{buttonText}</Trans>
      )}
    </ButtonPrimary>
  )
}

export function TradeConfirmation(props: TradeConfirmationProps): ReactElement {
  const { currentProps, hasPendingTrade, isConfirmClicked, setIsConfirmClicked, forcePriceConfirmation } =
    useTradeConfirmationState(props)

  const { showRecipientWarning, isPriceChanged, resetPriceChanged, isButtonDisabled, isLoadingState } =
    useTradeConfirmationLogic(currentProps, hasPendingTrade, isConfirmClicked, forcePriceConfirmation)

  const isUpToMedium = useMediaQuery(upToMedium)

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  // Combine local onClick logic with incoming onClick
  const handleConfirmClick = (): void => {
    if (isUpToMedium) {
      window.scrollTo({ top: 0, left: 0 })
    }
    setIsConfirmClicked(true)
    currentProps.onConfirm()
  }

  return (
    <styledEl.WidgetWrapper onKeyDown={(e) => e.key === 'Escape' && currentProps.onDismiss()}>
      <TradeConfirmationHeader
        title={currentProps.title}
        onDismiss={currentProps.onDismiss}
        hasPendingTrade={hasPendingTrade}
        isQuoteLoading={currentProps.isQuoteLoading || false}
        refreshInterval={currentProps.refreshInterval}
      />
      <styledEl.ContentWrapper id="trade-confirmation">
        <TradeConfirmationContent
          isLoadingState={isLoadingState}
          inputCurrencyInfo={currentProps.inputCurrencyInfo}
          outputCurrencyInfo={currentProps.outputCurrencyInfo}
          priceImpact={currentProps.priceImpact}
          children={currentProps.children}
          appData={currentProps.appData}
          showRecipientWarning={showRecipientWarning}
          isPriceChanged={isPriceChanged}
          isPriceStatic={currentProps.isPriceStatic}
          resetPriceChanged={resetPriceChanged}
        />
        <TradeConfirmationButton
          handleConfirmClick={handleConfirmClick}
          isButtonDisabled={isButtonDisabled}
          isLoadingState={isLoadingState}
          hasPendingTrade={hasPendingTrade}
          isConfirmClicked={isConfirmClicked}
          buttonText={currentProps.buttonText || 'Confirm'}
        />
      </styledEl.ContentWrapper>
    </styledEl.WidgetWrapper>
  )
}
