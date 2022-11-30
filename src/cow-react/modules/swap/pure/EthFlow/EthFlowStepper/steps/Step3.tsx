import React, { useMemo } from 'react'
import Finish from 'assets/cow-swap/finish.svg'
import Checkmark from 'assets/cow-swap/checkmark.svg'
import Refund from 'assets/cow-swap/refund.svg'
import styled from 'styled-components/macro'
import { EthFlowStepperProps, SmartOrderStatus } from '..'
import { Step, StepProps, ExplorerLinkStyled } from '../Step'

const RefundMessage = styled.span`
  color: ${({ theme }) => theme.text1};
  font-weight: 500;
`

const ExpiredMessage = styled.span`
  color: ${({ theme }) => theme.warning};
`

export function Step3({ nativeTokenSymbol, tokenLabel, order, refund, cancelation }: EthFlowStepperProps) {
  const { state, isExpired, rejectedReason } = order
  const { isRefunded, refundTx } = refund
  const { isCanceled, cancelationTx } = cancelation

  const isIndexing = state === SmartOrderStatus.CREATION_MINED
  const isIndexed = state === SmartOrderStatus.INDEXED
  const isCreating = state === SmartOrderStatus.CREATING
  const isFilled = state === SmartOrderStatus.FILLED
  const expiredBeforeCreate = isExpired && (isCreating || isIndexing)

  // Get the label, state and icon
  const {
    label,
    state: stepState,
    icon,
  } = useMemo<StepProps>(() => {
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
    if (isCanceled || isRefunded) {
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
  }, [nativeTokenSymbol, tokenLabel, expiredBeforeCreate, isIndexing, isFilled, isCanceled, isRefunded, isIndexed])

  const isRefunding = !!refundTx && !isRefunded
  const isCanceling = !!cancelationTx && !isCanceled
  const isOrderRejected = !!rejectedReason
  const wontReceiveToken = isExpired || isOrderRejected || isRefunding || isCanceling || isCanceled || isRefunded
  const isSuccess = stepState === 'success'

  let refundLink: JSX.Element | undefined
  if (cancelationTx && !isRefunded) {
    refundLink = (
      <ExplorerLinkStyled
        type="transaction"
        label={isCanceling ? 'Initiating ETH Refund...' : 'ETH refunded successfully'}
        id={cancelationTx}
      />
    )
  } else if ((refundTx && !(expiredBeforeCreate || cancelationTx)) || (refundTx && isRefunded)) {
    refundLink = (
      <ExplorerLinkStyled
        type="transaction"
        label={isRefunding ? 'Receiving ETH Refund...' : 'ETH refunded successfully'}
        id={refundTx}
      />
    )
  }

  const crossOut = !isSuccess && wontReceiveToken
  return (
    <Step state={stepState} icon={icon} label={label} crossOut={crossOut}>
      <>
        {isExpired && !(isSuccess || isOrderRejected) && <ExpiredMessage>Order has expired</ExpiredMessage>}
        {wontReceiveToken && !(refundTx || cancelationTx) && <RefundMessage>Initiating ETH Refund...</RefundMessage>}
        {refundLink}
      </>
    </Step>
  )
}
