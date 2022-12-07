import React from 'react'
import Send from 'assets/cow-swap/send.svg'
import Exclamation from 'assets/cow-swap/exclamation.svg'
import Checkmark from 'assets/cow-swap/checkmark.svg'
import { EthFlowStepperProps, SmartOrderStatus } from '..'
import { StatusIconState } from '../StatusIcon'
import { Step, ExplorerLinkStyled } from '../Step'

export function Step1({ nativeTokenSymbol, order }: EthFlowStepperProps) {
  const { state, isExpired, createOrderTx } = order
  const isCreating = state === SmartOrderStatus.CREATING

  let label: string, stepState: StatusIconState, icon: string
  if (isCreating) {
    label = 'Sending ' + nativeTokenSymbol
    if (isExpired) {
      stepState = 'error'
      icon = Exclamation
    } else {
      stepState = 'pending'
      icon = Send
    }
  } else {
    label = 'Sent ' + nativeTokenSymbol
    stepState = 'success'
    icon = Checkmark
  }

  return (
    <Step state={stepState} icon={icon} label={label}>
      {createOrderTx && <ExplorerLinkStyled type="transaction" label="View Transaction" id={createOrderTx} />}
    </Step>
  )
}
