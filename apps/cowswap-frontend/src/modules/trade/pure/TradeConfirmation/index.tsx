/* eslint-disable complexity */
/* eslint-disable max-lines-per-function */
import { ReactElement, ReactNode, useEffect, useRef, useState } from 'react'

import { BackButton, ButtonPrimary, UI } from '@cowprotocol/ui'

import { useLingui } from '@lingui/react/macro'
import { useSigningStep } from 'entities/trade'
import { isNonEvmPrototypeEnabled } from 'prototype/nonEvmPrototype'
import styled from 'styled-components/macro'

import { PriceImpact } from 'legacy/hooks/usePriceImpact'

import { getChainType } from 'common/chains/nonEvm'
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
  useEffect(() => {
    propsRef.current = _props
  }, [_props])

  const [frozenProps, setFrozenProps] = useState<TradeConfirmationProps | null>(null)
  const hasPendingTrade = !!pendingTrade

  const props = frozenProps || _props
  const { onConfirm, onDismiss, isConfirmDisabled, buttonText, children, isPriceStatic, appData, recipient } = props

  const destinationChainId = props.outputCurrencyInfo.amount?.currency.chainId
  const destinationChainType = getChainType(destinationChainId)
  const isNonEvmPrototypeFlow = isNonEvmPrototypeEnabled() && destinationChainType !== 'evm'
  const nonEvmLogoUrl = destinationChainId ? getNonEvmAllowlist(destinationChainId)?.tokens[0]?.logoUrl : undefined

  const [isPrototypeEndScreen, setIsPrototypeEndScreen] = useState(false)

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

    setIsPrototypeEndScreen(false)
  }, [hasPendingTrade, recipient, destinationChainId])

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

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
          {hasPendingTrade || isPriceStatic ? null : <QuoteCountdown />}
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
