import React from 'react'
import { Icon, Flag, Check } from 'react-feather'
import styled from 'styled-components/macro'
import { ExplorerLinkStyled, EthFlowStepperProps, SmartOrderStatus } from '..'
import { StatusIconState } from '../StatusIcon'
import { Step } from '../Step'

const RefundMessage = styled.span`
  color: #0d5ed9;
`

const ExpiredMessage = styled.span``

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

  let label: string, stepStatus: StatusIconState, icon: Icon
  if (expiredBeforeCreate) {
    label = 'Receive ' + tokenLabel
    stepStatus = 'pending'
    icon = Flag
  } else if (isIndexing) {
    label = 'Receive ' + tokenLabel
    stepStatus = 'not-started'
    icon = Flag
  } else if (isFilled) {
    label = 'Received ' + tokenLabel
    stepStatus = 'success'
    icon = Check
  } else if (isCanceled || isRefunded) {
    label = nativeTokenSymbol + ' Refunded'
    stepStatus = 'success'
    icon = Check
  } else if (isIndexed) {
    label = 'Receive ' + tokenLabel
    stepStatus = 'pending'
    icon = Flag
  } else {
    label = 'Receive ' + tokenLabel
    stepStatus = 'not-started'
    icon = Flag
  }

  const isOrderRejected = !!rejectedReason
  const wontReceiveToken = isExpired || isOrderRejected || isRefunding || isCanceling || isCanceled || isRefunded
  const isSuccess = stepStatus === 'success'

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
      {/* <p className={!isSuccess && wontReceiveToken ? 'crossOut' : stepStatus}>{label}</p> */}
      {/* <StepLabel crossOut={!isSuccess && wontReceiveToken}>{message}</StepLabel> */}
      {isExpired && !(isSuccess || isOrderRejected) && <ExpiredMessage>Order is Expired</ExpiredMessage>}

      {wontReceiveToken && !(refundTx || cancelationTx) && <RefundMessage>Initiating ETH Refund...</RefundMessage>}
      {refundLink}
    </>
  )
  return <Step statusIconState={stepStatus} details={details} icon={icon} label={label} crossOut={crossOut} />
}
