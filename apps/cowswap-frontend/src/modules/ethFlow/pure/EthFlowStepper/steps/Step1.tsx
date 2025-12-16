import { ReactNode } from 'react'

import Checkmark from '@cowprotocol/assets/cow-swap/checkmark.svg'
import Exclamation from '@cowprotocol/assets/cow-swap/exclamation.svg'
import Send from '@cowprotocol/assets/cow-swap/send.svg'
import X from '@cowprotocol/assets/cow-swap/x.svg'

import { t } from '@lingui/core/macro'

import { EthFlowStepperProps, SmartOrderStatus } from '../index'
import { StatusIconState } from '../StatusIcon'
import { ExplorerLinkStyled, Step } from '../Step'

interface Step1Config {
  icon: string
  state: StatusIconState
  label: string
}

export function Step1(props: EthFlowStepperProps): ReactNode {
  const {
    creation: { hash, replaced },
  } = props

  const { label, state, icon } = getStepConfig(props)

  return (
    <Step state={state} icon={icon} label={label}>
      {hash && !replaced && <ExplorerLinkStyled type="transaction" label={t`View transaction`} id={hash} />}
    </Step>
  )
}

function getStepConfig({ order, creation, nativeTokenSymbol }: EthFlowStepperProps): Step1Config {
  const { failed, cancelled, replaced } = creation

  const isFilled = order.state === SmartOrderStatus.FILLED
  const isCreating = order.state === SmartOrderStatus.CREATING
  const isExpired = order.isExpired
  const hasTransactionError = (failed || cancelled || (replaced && isCreating)) && !isFilled

  // Error states
  if (hasTransactionError) {
    const errorType = failed ? t`failed` : cancelled ? t`cancelled` : t`replaced`
    return {
      icon: X,
      state: 'error',
      label: t`Transaction ${errorType}`,
    }
  }

  if (isCreating && isExpired) {
    return {
      icon: Exclamation,
      state: 'error',
      label: t`Order Expired`,
    }
  }

  // In-progress state
  if (isCreating) {
    return {
      icon: Send,
      state: 'pending',
      label: t`Sending ${nativeTokenSymbol}`,
    }
  }

  // Success state
  return {
    icon: Checkmark,
    state: 'success',
    label: t`Sent ${nativeTokenSymbol}`,
  }
}
