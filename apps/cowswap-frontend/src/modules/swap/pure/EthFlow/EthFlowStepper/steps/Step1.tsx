import React from 'react'

import Checkmark from 'legacy/assets/cow-swap/checkmark.svg'
import Exclamation from 'legacy/assets/cow-swap/exclamation.svg'
import Send from 'legacy/assets/cow-swap/send.svg'
import X from 'legacy/assets/cow-swap/x.svg'

import { EthFlowStepperProps, SmartOrderStatus } from '..'
import { StatusIconState } from '../StatusIcon'
import { Step, ExplorerLinkStyled } from '../Step'

export function Step1({ nativeTokenSymbol, order, creation }: EthFlowStepperProps) {
  const { state, isExpired } = order
  const isCreating = state === SmartOrderStatus.CREATING
  const { hash, failed } = creation

  let label: string, stepState: StatusIconState, icon: string

  if (failed) {
    label = 'Transaction failed'
    stepState = 'error'
    icon = X
  } else if (isCreating) {
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
      {hash && <ExplorerLinkStyled type="transaction" label="View transaction" id={hash} />}
    </Step>
  )
}
