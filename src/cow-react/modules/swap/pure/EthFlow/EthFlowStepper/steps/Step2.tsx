import React from 'react'
import { Icon, X, Plus, Check } from 'react-feather'
import styled from 'styled-components/macro'
import { ExplorerLinkStyled, EthFlowStepperProps, SmartOrderStatus } from '..'
import { StatusIconState } from '../StatusIcon'
import { Step } from '../Step'

const RejectMessage = styled.span`
  color: #f25757;
`

export function Step2({ order }: EthFlowStepperProps) {
  const { state, isExpired, orderId } = order
  let rejectedReason = order.rejectedReason
  const isCreating = state === SmartOrderStatus.CREATING
  const isIndexing = state === SmartOrderStatus.CREATION_MINED
  const isOrderCreated = !(isCreating || isIndexing)

  const expiredBeforeCreate = isExpired && (isCreating || isIndexing)

  let label: string, stepStatus: StatusIconState, icon: Icon
  if (expiredBeforeCreate) {
    label = 'Order Creation Failed'
    rejectedReason = 'Expired before creation'
    stepStatus = 'error'
    icon = X
  } else if (isCreating) {
    label = 'Create Order'
    stepStatus = 'not-started'
    icon = Plus
  } else if (isIndexing) {
    label = 'Creating Order'
    stepStatus = 'pending'
    icon = Plus
  } else if (rejectedReason) {
    label = 'Order Creation Failed'
    stepStatus = 'error'
    icon = X
  } else {
    label = 'Order Created'
    stepStatus = 'success'
    icon = Check
  }

  const details = (
    <>
      {rejectedReason && <RejectMessage>{rejectedReason}</RejectMessage>}
      {isOrderCreated && <ExplorerLinkStyled type="transaction" label="View details" id={orderId} />}
    </>
  )
  return <Step statusIconState={stepStatus} details={details} icon={icon} label={label} />
}
