import React from 'react'
import { Icon, Send, Check, AlertTriangle } from 'react-feather'
import { ExplorerLinkStyled, EthFlowStepperProps, SmartOrderStatus } from '..'
import { StatusIconState } from '../StatusIcon'
import { Step } from '../Step'

export function Step1({ nativeTokenSymbol, order }: EthFlowStepperProps) {
  const { state, isExpired, createOrderTx } = order
  const isCreating = state === SmartOrderStatus.CREATING

  let label: string, stepState: StatusIconState, icon: Icon
  if (isCreating) {
    label = 'Sending ' + nativeTokenSymbol
    if (isExpired) {
      stepState = 'error'
      icon = AlertTriangle
    } else {
      stepState = 'pending'
      icon = Send
    }
  } else {
    label = 'Sent ' + nativeTokenSymbol
    stepState = 'success'
    icon = Check
  }

  const details = (
    <>{createOrderTx && <ExplorerLinkStyled type="transaction" label="View Transaction" id={createOrderTx} />}</>
  )
  return <Step state={stepState} details={details} icon={icon} label={label} />
}
