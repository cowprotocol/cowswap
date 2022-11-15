import React from 'react'
import { Icon, Send, Check, AlertTriangle } from 'react-feather'
import { ExplorerLinkStyled, EthFlowStepperProps, SmartOrderStatus } from '..'
import { StatusIconState } from '../StatusIcon'
import { Step } from '../Step'

export function Step1({ nativeTokenSymbol, order }: EthFlowStepperProps) {
  const { state, isExpired, createOrderTx } = order
  const isCreating = state === SmartOrderStatus.CREATING

  let message: string, stepStatus: StatusIconState, icon: Icon
  if (isCreating) {
    message = 'Sending ' + nativeTokenSymbol
    if (isExpired) {
      stepStatus = 'error'
      icon = AlertTriangle
    } else {
      stepStatus = 'pending'
      icon = Send
    }
  } else {
    message = 'Sent ' + nativeTokenSymbol
    stepStatus = 'success'
    icon = Check
  }

  const details = (
    <>
      <p className={isExpired && isCreating ? 'error' : stepStatus}>{message}</p>
      {createOrderTx && <ExplorerLinkStyled type="transaction" label="View Transaction" id={createOrderTx} />}
    </>
  )
  return <Step statusIconState={stepStatus} details={details} icon={icon} />
}
