import React from 'react'
import { Icon, X, Plus, Check } from 'react-feather'
import { ExplorerLinkStyled, EthFlowStepperProps, SmartOrderStatus } from '..'
import { StatusIconState } from '../StatusIcon'
import { Step } from '../Step'

export function Step2({ order }: EthFlowStepperProps) {
  const { state, isExpired, orderId } = order
  let rejectedReason = order.rejectedReason
  const isCreating = state === SmartOrderStatus.CREATING
  const isIndexing = state === SmartOrderStatus.CREATION_MINED
  const isOrderCreated = !(isCreating || isIndexing)

  const expiredBeforeCreate = isExpired && (isCreating || isIndexing)

  let message: string, stepStatus: StatusIconState, icon: Icon
  if (expiredBeforeCreate) {
    message = 'Order Creation Failed'
    rejectedReason = 'Expired before creation'
    stepStatus = 'error'
    icon = X
  } else if (isCreating) {
    message = 'Create Order'
    stepStatus = 'not-started'
    icon = Plus
  } else if (isIndexing) {
    message = 'Creating Order'
    stepStatus = 'pending'
    icon = Plus
  } else if (rejectedReason) {
    message = 'Order Creation Failed'
    stepStatus = 'error'
    icon = X
  } else {
    message = 'Order Created'
    stepStatus = 'success'
    icon = Check
  }

  const details = (
    <>
      <p className={stepStatus}>{message}</p>
      {rejectedReason && <p className={stepStatus}>{rejectedReason}</p>}
      {isOrderCreated && <ExplorerLinkStyled type="transaction" label="View details" id={orderId} />}
    </>
  )
  return <Step statusIconState={stepStatus} details={details} icon={icon} />
}
