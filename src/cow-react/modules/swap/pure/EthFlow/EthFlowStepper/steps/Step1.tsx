import React from 'react'
import { Icon, Send, Check, AlertTriangle } from 'react-feather'
import { EthFlowStepperProps, ExplorerLinkStyled, SmartOrderStatus } from '..'
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

  return (
    <Step state={stepState} icon={icon} label={label}>
      {createOrderTx && <ExplorerLinkStyled type="transaction" label="View Transaction" id={createOrderTx} />}
    </Step>
  )
}
