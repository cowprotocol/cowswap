import React, { useMemo } from 'react'

import Checkmark from '@cowprotocol/assets/cow-swap/checkmark.svg'
import Exclamation from '@cowprotocol/assets/cow-swap/exclamation.svg'
import Finish from '@cowprotocol/assets/cow-swap/finish.svg'
import Refund from '@cowprotocol/assets/cow-swap/refund.svg'

import styled from 'styled-components/macro'

import { UI } from 'common/constants/theme'

import { EthFlowStepperProps, SmartOrderStatus } from '..'
import { Step, StepProps, ExplorerLinkStyled } from '../Step'

const RefundMessage = styled.span`
  color: var(${UI.COLOR_TEXT1});
  font-weight: 500;
`

const ExpiredMessage = styled.span`
  color: ${({ theme }) => theme.warning};
`

export function Step3({ nativeTokenSymbol, tokenLabel, order, creation, refund, cancellation }: EthFlowStepperProps) {
  const { state, isExpired, rejectedReason } = order
  const { failed: creationFailed } = creation
  const { hash: refundHash, failed: refundFailed } = refund
  const { hash: cancellationHash, failed: cancellationFailed } = cancellation

  const isIndexing = state === SmartOrderStatus.CREATION_MINED
  const isIndexed = state === SmartOrderStatus.INDEXED
  const isCreating = state === SmartOrderStatus.CREATING
  const isFilled = state === SmartOrderStatus.FILLED
  const expiredBeforeCreate = isExpired && (isCreating || isIndexing)
  const isRefunded = refundFailed === false || cancellationFailed === false

  // Get the label, state and icon
  const {
    label,
    state: stepState,
    icon,
  } = useMemo<StepProps>(() => {
    if (creationFailed) {
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
  }, [expiredBeforeCreate, isIndexing, isFilled, isRefunded, creationFailed, isIndexed, tokenLabel, nativeTokenSymbol])

  const isRefunding = !!refundHash && refundFailed === undefined
  const isCanceling = !!cancellationHash && cancellationFailed === undefined
  const isOrderRejected = !!rejectedReason
  const wontReceiveToken = !isFilled && (isExpired || isOrderRejected || isRefunding || isCanceling || isRefunded)
  const isSuccess = stepState === 'success'

  let refundLink: JSX.Element | undefined

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
        {!creationFailed && isExpired && !(isSuccess || isOrderRejected) && (
          <ExpiredMessage>Order has expired</ExpiredMessage>
        )}
        {!creationFailed &&
          !isRefunded &&
          wontReceiveToken &&
          !(refundHash || cancellationHash) &&
          cancellationFailed === undefined && <RefundMessage>Initiating {nativeTokenSymbol} Refund...</RefundMessage>}
        {creationFailed && <RefundMessage>{nativeTokenSymbol} Refunded</RefundMessage>}
        {refundLink}
      </>
    </Step>
  )
}
