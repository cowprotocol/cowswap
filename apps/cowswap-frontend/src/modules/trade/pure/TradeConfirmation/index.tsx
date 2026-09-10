import { ReactElement, ReactNode, useEffect } from 'react'

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
import { useFreezeOnConfirm } from './hooks/useFreezeOnConfirm'
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
  /**
   * Rendered from the click-time snapshot, so every value captured in here is frozen for the rest
   * of the flow. Anything that must keep updating while signing (e.g. signing-step UI) has to read
   * it from a hook inside a child component instead of closing over it here.
   */
  children?: (restContent: ReactElement) => ReactElement
  confirmClickEvent?: string
  hasSigningPlan?: boolean
}

export function TradeConfirmation(_props: TradeConfirmationProps): ReactNode {
  const { forcePriceConfirmation } = useTradeConfirmState()
  const { t } = useLingui()
  const signingStep = useSigningStep()

  /**
   * Once the user clicks confirm, the whole review screen is served from a snapshot taken at that
   * moment, so the amounts shown can never drift from what was actually confirmed/signed.
   */
  const { props, isConfirming, handleConfirm } = useFreezeOnConfirm(_props, _props.onConfirm)

  const { onDismiss, isConfirmDisabled, buttonText, children, isPriceStatic, appData, confirmClickEvent } = props
  // Layout/labels follow the live signing state - only quote-derived values need freezing.
  const { title, hasSigningPlan } = _props

  const { isPriceChanged, resetPriceChanged } = useIsPriceChanged(
    props.inputCurrencyInfo.amount?.toExact(),
    props.outputCurrencyInfo.amount?.toExact(),
    forcePriceConfirmation,
  )

  const isButtonDisabled = isConfirmDisabled || (isPriceChanged && !isPriceStatic) || isConfirming

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
        rightSlot={isConfirming || isPriceStatic ? null : <QuoteCountdown />}
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
              onConfirm={handleConfirm}
              buttonText={buttonText ? buttonText : t`Confirm`}
              isButtonDisabled={isButtonDisabled}
              isConfirming={isConfirming}
              signingStep={signingStep}
              clickEvent={confirmClickEvent}
            />
          </>
        )}
      </Modal.Content>
    </Modal.Root>
  )
}
