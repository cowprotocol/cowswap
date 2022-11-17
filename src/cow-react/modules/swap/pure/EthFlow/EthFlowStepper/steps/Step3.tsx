import React, { useCallback } from 'react'
import { Flag, Check } from 'react-feather'
import styled from 'styled-components/macro'
import { ExplorerLinkStyled, EthFlowStepperProps, SmartOrderStatus } from '..'
import { Step, StepProps } from '../Step'

const RefundMessage = styled.span`
  color: #0d5ed9;
`

const ExpiredMessage = styled.span``

type BasicStepProps = Pick<StepProps, 'label' | 'statusIconState' | 'icon'>

export function Step3({ nativeTokenSymbol, tokenLabel, order, refund, cancelation }: EthFlowStepperProps) {
  const { state, isExpired, rejectedReason } = order
  const { isRefunded, refundTx } = refund
  const { isCanceled, cancelationTx } = cancelation

  const isIndexing = state === SmartOrderStatus.CREATION_MINED
  const isIndexed = state === SmartOrderStatus.INDEXED
  const isCreating = state === SmartOrderStatus.CREATING
  const isFilled = state === SmartOrderStatus.FILLED

  const isRefunding = !!refundTx && !isRefunded
  const isCanceling = !!cancelationTx && !isCanceled

  const expiredBeforeCreate = isExpired && (isCreating || isIndexing)

  // Get the label, status and icon
  const { label, statusIconState, icon } = useCallback<() => BasicStepProps>(() => {
    if (expiredBeforeCreate) {
      return {
        label: 'Receive ' + tokenLabel,
        statusIconState: 'pending',
        icon: Flag,
      }
    }
    if (isIndexing) {
      return {
        label: 'Receive ' + tokenLabel,
        statusIconState: 'not-started',
        icon: Flag,
      }
    }
    if (isFilled) {
      return {
        label: 'Received ' + tokenLabel,
        statusIconState: 'success',
        icon: Check,
      }
    }
    if (isCanceled || isRefunded) {
      return {
        label: nativeTokenSymbol + ' Refunded',
        statusIconState: 'success',
        icon: Check,
      }
    }
    if (isIndexed) {
      return {
        label: 'Receive ' + tokenLabel,
        statusIconState: 'pending',
        icon: Flag,
      }
    }

    return {
      label: 'Receive ' + tokenLabel,
      statusIconState: 'not-started',
      icon: Flag,
    }
  }, [nativeTokenSymbol, tokenLabel, expiredBeforeCreate, isIndexing, isFilled, isCanceled, isRefunded, isIndexed])()

  const isOrderRejected = !!rejectedReason
  const wontReceiveToken = isExpired || isOrderRejected || isRefunding || isCanceling || isCanceled || isRefunded
  const isSuccess = statusIconState === 'success'

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
  const details = (
    <>
      {isExpired && !(isSuccess || isOrderRejected) && <ExpiredMessage>Order is Expired</ExpiredMessage>}
      {wontReceiveToken && !(refundTx || cancelationTx) && <RefundMessage>Initiating ETH Refund...</RefundMessage>}
      {refundLink}
    </>
  )
  return <Step statusIconState={statusIconState} details={details} icon={icon} label={label} crossOut={crossOut} />
}
