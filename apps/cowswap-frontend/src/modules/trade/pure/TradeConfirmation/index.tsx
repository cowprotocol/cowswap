import { ReactElement, useEffect, useRef, useState } from 'react'

import {
  BackButton,
  BannerOrientation,
  ButtonPrimary,
  ButtonSize,
  CenteredDots,
  CustomRecipientWarningBanner,
  LongLoadText,
} from '@cowprotocol/ui'

import { Trans } from '@lingui/macro'
import ms from 'ms.macro'

import { upToMedium, useMediaQuery } from 'legacy/hooks/useMediaQuery'
import { PriceImpact } from 'legacy/hooks/usePriceImpact'

import type { AppDataInfo } from 'modules/appData'

import { OrderHooksDetails } from 'common/containers/OrderHooksDetails'
import { CurrencyAmountPreview, CurrencyPreviewInfo } from 'common/pure/CurrencyInputPanel'

import { QuoteCountdown } from './CountDown'
import { useIsPriceChanged } from './hooks/useIsPriceChanged'
import * as styledEl from './styled'

import { NoImpactWarning } from '../../containers/NoImpactWarning'
import { useTradeConfirmState } from '../../hooks/useTradeConfirmState'
import { PriceUpdatedBanner } from '../PriceUpdatedBanner'

const ONE_SEC = ms`1s`

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
  title: JSX.Element | string
  refreshInterval?: number
  isPriceStatic?: boolean
  recipient?: string | null
  buttonText?: React.ReactNode
  children?: (restContent: ReactElement) => ReactElement
}

export function TradeConfirmation(props: TradeConfirmationProps) {
  const { pendingTrade } = useTradeConfirmState()

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
    refreshInterval,
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

  const { isPriceChanged, resetPriceChanged } = useIsPriceChanged(inputAmount, outputAmount)

  const isButtonDisabled = isConfirmDisabled || (isPriceChanged && !isPriceStatic) || hasPendingTrade

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

  const hookDetailsElement = (
    <>{appData && <OrderHooksDetails appData={appData}>{(hookChildren) => hookChildren}</OrderHooksDetails>}</>
  )

  return (
    <styledEl.WidgetWrapper onKeyDown={(e) => e.key === 'Escape' && onDismiss()}>
      <styledEl.Header>
        <BackButton onClick={onDismiss} />
        <styledEl.ConfirmHeaderTitle>{title}</styledEl.ConfirmHeaderTitle>

        <styledEl.HeaderRightContent>
          {hasPendingTrade ? null : nextUpdateAt !== undefined && <QuoteCountdown nextUpdateAt={nextUpdateAt} />}
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
        <ButtonPrimary onClick={handleConfirmClick} disabled={isButtonDisabled} buttonSize={ButtonSize.BIG}>
          {hasPendingTrade ? (
            <LongLoadText fontSize={15} fontWeight={500}>
              Confirm with your wallet <CenteredDots smaller />
            </LongLoadText>
          ) : (
            <Trans>{buttonText}</Trans>
          )}
        </ButtonPrimary>
      </styledEl.ContentWrapper>
    </styledEl.WidgetWrapper>
  )
}
