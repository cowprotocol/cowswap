/* eslint-disable complexity */
/* eslint-disable max-lines-per-function */
import { ReactElement, ReactNode, useEffect, useRef, useState } from 'react'

import {
  BackButton,
  BannerOrientation,
  ButtonPrimary,
  ExternalLink,
  InlineBanner,
  StatusColorVariant,
  UI,
} from '@cowprotocol/ui'

import { useLingui } from '@lingui/react/macro'
import { useSigningStep } from 'entities/trade'
import { isNonEvmPrototypeEnabled } from 'prototype/nonEvmPrototype'
import styled from 'styled-components/macro'

import { PriceImpact } from 'legacy/hooks/usePriceImpact'

import { getChainType, getNonEvmChainLabel } from 'common/chains/nonEvm'
import { getNonEvmAllowlist } from 'common/chains/nonEvmTokenAllowlist'
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
import { useTradeConfirmState } from '../../hooks/useTradeConfirmState'

const StepScreen = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 6px 2px 2px;
`

const StepIconWrapper = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  margin: 4px auto 2px;
  background: var(${UI.COLOR_PAPER_DARKER});
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
`

const StepIcon = styled.img`
  width: 56px;
  height: 56px;
  border-radius: 50%;
`

const StepTitle = styled.h3`
  margin: 0 0 10px;
  font-size: 21px;
  font-weight: 600;
  text-align: center;
`

const StepAddress = styled.div`
  word-break: break-all;
  text-align: center;
  font-weight: 600;
`

const StepAddressPanel = styled.div`
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 18px;
  padding: 16px;
  border-radius: 16px;
  background: var(${UI.COLOR_PAPER_DARKER});
`

const StepAddressPanelHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  font-size: 16px;
`

const StepAddressPanelRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`

const StepAddressPanelIcon = styled.img`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  flex: 0 0 auto;
`

const StepAddressPanelText = styled.div<{ $isSolana?: boolean }>`
  min-width: 0;
  font-size: 24px;
  font-weight: 400;
  line-height: 1.2;
  white-space: normal;
  overflow-wrap: anywhere;
  word-break: break-word;
  color: ${({ $isSolana }) => ($isSolana ? `var(${UI.COLOR_TEXT_OPACITY_70})` : `var(${UI.COLOR_TEXT})`)};

  > span[data-highlight='true'] {
    color: var(${UI.COLOR_TEXT});
    font-weight: 600;
  }
`

const StepExplorerLink = styled(ExternalLink)`
  font-size: 14px;
  color: var(${UI.COLOR_TEXT_OPACITY_70});
`

const StepWarning = styled(InlineBanner)`
  margin-top: 4px;
  padding: 12px;
  font-size: 14px;
  line-height: 1.4;
  text-align: left;
`

const StepActions = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 4px;

  > * {
    width: 100%;
  }
`

const StepSingleAction = styled.div`
  margin-top: 6px;
`

export interface TradeConfirmationProps extends CommonTradeConfirmContext {
  onConfirm(): Promise<void | false>
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
}

export function TradeConfirmation(_props: TradeConfirmationProps): ReactNode {
  const { pendingTrade, forcePriceConfirmation } = useTradeConfirmState()
  const { t } = useLingui()
  const signingStep = useSigningStep()

  const propsRef = useRef(_props)

  propsRef.current = _props

  const [frozenProps, setFrozenProps] = useState<TradeConfirmationProps | null>(null)
  const hasPendingTrade = !!pendingTrade

  const props = frozenProps || _props
  const { onConfirm, onDismiss, isConfirmDisabled, buttonText, children, isPriceStatic, appData, recipient } = props

  const destinationChainId = props.outputCurrencyInfo.amount?.currency.chainId
  const destinationChainType = getChainType(destinationChainId)
  const isNonEvmPrototypeFlow = isNonEvmPrototypeEnabled() && destinationChainType !== 'evm'
  const isSolanaDestination = destinationChainType === 'solana'
  const chainLabel = destinationChainId ? getNonEvmChainLabel(destinationChainId) : undefined
  const nonEvmLogoUrl = destinationChainId ? getNonEvmAllowlist(destinationChainId)?.tokens[0]?.logoUrl : undefined
  const solanaExplorerUrl = isSolanaDestination && recipient ? `https://solscan.io/account/${recipient}` : undefined

  const shouldShowRecipientStep = isNonEvmPrototypeFlow && Boolean(recipient)
  const [isRecipientConfirmed, setIsRecipientConfirmed] = useState(!shouldShowRecipientStep)
  const [isPrototypeEndScreen, setIsPrototypeEndScreen] = useState(false)
  const isRecipientStepActive = shouldShowRecipientStep && !isRecipientConfirmed && !isPrototypeEndScreen

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
    if (hasPendingTrade) return

    setIsRecipientConfirmed(!shouldShowRecipientStep)
    setIsPrototypeEndScreen(false)
  }, [hasPendingTrade, shouldShowRecipientStep, recipient, destinationChainId])

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  const recipientContent = (() => {
    if (!recipient) return null

    if (!isSolanaDestination) {
      return recipient
    }

    const trimmedRecipient = recipient.trim()
    if (trimmedRecipient.length <= 8) {
      return <span data-highlight="true">{trimmedRecipient}</span>
    }

    const first = trimmedRecipient.slice(0, 4)
    const middle = trimmedRecipient.slice(4, -4)
    const last = trimmedRecipient.slice(-4)

    return (
      <>
        <span data-highlight="true">{first}</span>
        <span>{middle}</span>
        <span data-highlight="true">{last}</span>
      </>
    )
  })()

  const handlePrototypeConfirm = async (): Promise<void | false> => {
    if (!isNonEvmPrototypeFlow) {
      return onConfirm()
    }

    setIsPrototypeEndScreen(true)
    return false
  }

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
        <styledEl.ConfirmHeaderTitle>{props.title}</styledEl.ConfirmHeaderTitle>
        <styledEl.HeaderRightContent>
          {hasPendingTrade || isPriceStatic || isRecipientStepActive ? null : <QuoteCountdown />}
        </styledEl.HeaderRightContent>
      </styledEl.Header>
      <styledEl.ContentWrapper id="trade-confirmation">
        {isPrototypeEndScreen ? (
          <StepScreen>
            <StepIconWrapper>{nonEvmLogoUrl && <StepIcon src={nonEvmLogoUrl} alt="Chain icon" />}</StepIconWrapper>
            <StepTitle>{t`Non EVM prototype mode`}</StepTitle>
            <StepAddress>{t`Ends here.`}</StepAddress>
            <StepSingleAction>
              <ButtonPrimary onClick={onDismiss}>{t`Close`}</ButtonPrimary>
            </StepSingleAction>
          </StepScreen>
        ) : shouldShowRecipientStep && !isRecipientConfirmed ? (
          <StepScreen>
            <StepIconWrapper>{nonEvmLogoUrl && <StepIcon src={nonEvmLogoUrl} alt="Chain icon" />}</StepIconWrapper>
            <StepTitle>{t`Confirm recipient`}</StepTitle>
            <StepAddressPanel>
              <StepAddressPanelHeader>
                <span>{t`Send to wallet`}</span>
                {solanaExplorerUrl && (
                  <StepExplorerLink href={solanaExplorerUrl}>{`${t`View on explorer`} ↗`}</StepExplorerLink>
                )}
              </StepAddressPanelHeader>
              <StepAddressPanelRow>
                {nonEvmLogoUrl && <StepAddressPanelIcon src={nonEvmLogoUrl} alt="Chain icon" />}
                <StepAddressPanelText $isSolana={isSolanaDestination} title={recipient || undefined}>
                  {recipientContent}
                </StepAddressPanelText>
              </StepAddressPanelRow>
            </StepAddressPanel>
            <StepWarning bannerType={StatusColorVariant.Info} orientation={BannerOrientation.Horizontal}>
              <p>
                {chainLabel
                  ? t`Double-check the ${chainLabel} wallet recipient address. Wrong address = funds lost. Avoid direct transfers to exchanges to prevent fund loss.`
                  : t`Double-check the wallet recipient address. Wrong address = funds lost. Avoid direct transfers to exchanges to prevent fund loss.`}
              </p>
            </StepWarning>
            <StepActions>
              <ButtonPrimary onClick={() => setIsRecipientConfirmed(true)}>{t`Confirm`}</ButtonPrimary>
            </StepActions>
          </StepScreen>
        ) : (
          <>
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
              recipient={props.recipient}
              isPriceChanged={isPriceChanged}
              isPriceStatic={isPriceStatic}
              resetPriceChanged={resetPriceChanged}
            />

            <ConfirmButton
              onConfirm={handlePrototypeConfirm}
              buttonText={buttonText ? buttonText : t`Confirm`}
              isButtonDisabled={isButtonDisabled}
              hasPendingTrade={hasPendingTrade}
              signingStep={signingStep}
            />
          </>
        )}
      </styledEl.ContentWrapper>
    </styledEl.WidgetWrapper>
  )
}
