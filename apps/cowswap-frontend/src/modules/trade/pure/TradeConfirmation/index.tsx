import { ReactElement, ReactNode, useEffect, useRef, useState } from 'react'

import { Modal, ModalHeader } from '@cowprotocol/ui'

import { useLingui } from '@lingui/react/macro'
import { useSigningStep } from 'entities/trade'

import { PriceImpact } from 'legacy/hooks/usePriceImpact'

import { OrderHooksDetails } from 'common/containers/OrderHooksDetails'
import { CurrencyPreviewInfo } from 'common/pure/CurrencyInputPanel'

import { ConfirmAmounts } from './ConfirmAmounts'
import { ConfirmButton } from './ConfirmButton'
import { ConfirmWarnings } from './ConfirmWarnings'
import { QuoteCountdown } from './CountDown'
import { useIsPriceChanged } from './hooks/useIsPriceChanged'

import { NoImpactWarning } from '../../containers/NoImpactWarning'
import { CommonTradeConfirmContext } from '../../hooks/useCommonTradeConfirmContext'
import { useTradeConfirmState } from '../../hooks/useTradeConfirmState'

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
  confirmClickEvent?: string
  hasSigningPlan?: boolean
}

export function TradeConfirmation(_props: TradeConfirmationProps): ReactNode {
  const { pendingTrade, forcePriceConfirmation } = useTradeConfirmState()
  const { t } = useLingui()
  const signingStep = useSigningStep()

  const propsRef = useRef(_props)
  // eslint-disable-next-line react-hooks/refs
  propsRef.current = _props

  const [frozenProps, setFrozenProps] = useState<TradeConfirmationProps | null>(null)
  const hasPendingTrade = !!pendingTrade

  const props = frozenProps || _props

  // Freeze amounts/actions, but keep children live so signing-step UI (e.g. collapsible details) can update.
  const { onConfirm, onDismiss, isConfirmDisabled, buttonText, isPriceStatic, appData, confirmClickEvent } = props
  const { title, hasSigningPlan, children } = _props

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
    <Modal.Root>
      <ModalHeader
        title={title}
        onBack={hasSigningPlan ? undefined : onDismiss}
        onClose={hasSigningPlan ? onDismiss : undefined}
        // TODO: Consider still displaying this here or somewhere else?
        rightSlot={hasPendingTrade || isPriceStatic ? null : <QuoteCountdown />}
      />

      <Modal.Content id="trade-confirmation">
        <ConfirmAmounts
          variant={hasSigningPlan ? 'slim' : 'default'}
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

        {hasSigningPlan ? null : (
          <>
            <ConfirmWarnings
              account={props.account}
              ensName={props.ensName}
              recipient={props.recipient}
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
              clickEvent={confirmClickEvent}
            />
          </>
        )}
      </Modal.Content>
    </Modal.Root>
  )
}
