import { ReactElement, useMemo } from 'react'

import Checkmark from '@cowprotocol/assets/cow-swap/checkmark.svg'
import Exclamation from '@cowprotocol/assets/cow-swap/exclamation.svg'
import Finish from '@cowprotocol/assets/cow-swap/finish.svg'
import Refund from '@cowprotocol/assets/cow-swap/refund.svg'
import { UI } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

import { EthFlowStepperProps, SmartOrderStatus } from '../index'
import { ExplorerLinkStyled, Step, StepProps } from '../Step'

const RefundMessage = styled.span`
  color: inherit;
  font-weight: 500;
`

const ExpiredMessage = styled.span`
  color: var(${UI.COLOR_WARNING});
`

// TODO: Break down this large function into smaller functions
// TODO: Add proper return type annotation
// TODO: Reduce function complexity by extracting logic
// eslint-disable-next-line max-lines-per-function, @typescript-eslint/explicit-function-return-type, complexity
export function Step3({ nativeTokenSymbol, tokenLabel, order, creation, refund, cancellation }: EthFlowStepperProps) {
  const { state, isExpired, rejectedReason } = order
  const { failed: creationFailed, cancelled: creationCancelled, replaced: creationReplaced } = creation
  const { hash: refundHash, failed: refundFailed } = refund
  const { hash: cancellationHash, failed: cancellationFailed } = cancellation

  const isIndexing = state === SmartOrderStatus.CREATION_MINED
  const isIndexed = state === SmartOrderStatus.INDEXED
  const isCreating = state === SmartOrderStatus.CREATING
  const isFilled = state === SmartOrderStatus.FILLED
  const expiredBeforeCreate = isExpired && (isCreating || isIndexing)
  const isRefunded = refundFailed === false || cancellationFailed === false

  const orderIsNotCreated = !!(creationFailed || creationCancelled || creationReplaced) && !isFilled
  // Get the label, state and icon
  const {
    label,
    state: stepState,
    icon,
  } = useMemo<StepProps>(() => {
    if (orderIsNotCreated) {
      return {
        label: 'Receive ' + tokenLabel,
        state: 'not-started',
        icon: Exclamation,
      }
    }
    if (expiredBeforeCreate) {
      return {
        label: 'Receive ' + tokenLabel,
        state: 'pending',
        icon: Finish,
      }
    }
    if (isIndexing) {
      return {
        label: 'Receive ' + tokenLabel,
        state: 'not-started',
        icon: Finish,
      }
    }
    if (isFilled) {
      return {
        label: 'Received ' + tokenLabel,
        state: 'success',
        icon: Checkmark,
      }
    }
    if (isRefunded) {
      return {
        label: nativeTokenSymbol + ' Refunded',
        state: 'success',
        icon: Refund,
      }
    }
    if (isIndexed) {
      return {
        label: 'Receive ' + tokenLabel,
        state: 'pending',
        icon: Finish,
      }
    }

    return {
      label: 'Receive ' + tokenLabel,
      state: 'not-started',
      icon: Finish,
    }
  }, [
    expiredBeforeCreate,
    isIndexing,
    isFilled,
    isRefunded,
    orderIsNotCreated,
    isIndexed,
    tokenLabel,
    nativeTokenSymbol,
  ])

  const isRefunding = !!refundHash && refundFailed === undefined
  const isCanceling = !!cancellationHash && cancellationFailed === undefined
  const isOrderRejected = !!rejectedReason
  const wontReceiveToken = !isFilled && (isExpired || isOrderRejected || isRefunding || isCanceling || isRefunded)
  const isSuccess = stepState === 'success'

  let refundLink: ReactElement | undefined

  if (cancellationHash && refundFailed !== false && !isFilled) {
    refundLink = (
      <ExplorerLinkStyled
        type="transaction"
        label={isCanceling ? `Initiating ${nativeTokenSymbol} Refund...` : 'View transaction'}
        id={cancellationHash}
      />
    )
  } else if ((refundHash && !(expiredBeforeCreate || cancellationHash)) || (refundHash && isRefunded)) {
    refundLink = (
      <ExplorerLinkStyled
        type="transaction"
        label={isRefunding ? `Receiving ${nativeTokenSymbol} Refund...` : 'View transaction'}
        id={refundHash}
      />
    )
  }

  const crossOut = !isSuccess && wontReceiveToken
  return (
    <Step state={stepState} icon={icon} label={label} crossOut={crossOut}>
      <>
        {!orderIsNotCreated && isExpired && !(isSuccess || isOrderRejected) && (
          <ExpiredMessage>Order has expired</ExpiredMessage>
        )}
        {!orderIsNotCreated &&
          !isRefunded &&
          wontReceiveToken &&
          !(refundHash || cancellationHash) &&
          cancellationFailed === undefined && <RefundMessage>Initiating {nativeTokenSymbol} Refund...</RefundMessage>}
        {orderIsNotCreated && <RefundMessage>{nativeTokenSymbol} Refunded</RefundMessage>}
        {refundLink}
      </>
    </Step>
  )
}
