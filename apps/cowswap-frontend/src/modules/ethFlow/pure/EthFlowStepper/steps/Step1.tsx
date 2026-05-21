import { ReactNode } from 'react'

import svgCheckmarkSrc from '@cowprotocol/assets/cow-swap/checkmark.svg'
import svgExclamationSrc from '@cowprotocol/assets/cow-swap/exclamation.svg'
import svgSendSrc from '@cowprotocol/assets/cow-swap/send.svg'
import svgXSrc from '@cowprotocol/assets/cow-swap/x.svg'

import { t } from '@lingui/core/macro'

import { SmartOrderStatus } from '../constants'
import { EthFlowStepperProps } from '../index'
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
      icon: svgXSrc,
      state: 'error',
      label: t`Transaction ${errorType}`,
    }
  }

  if (isCreating && isExpired) {
    return {
      icon: svgExclamationSrc,
      state: 'error',
      label: t`Order Expired`,
    }
  }

  // In-progress state
  if (isCreating) {
    return {
      icon: svgSendSrc,
      state: 'pending',
      label: t`Sending ${nativeTokenSymbol}`,
    }
  }

  // Success state
  return {
    icon: svgCheckmarkSrc,
    state: 'success',
    label: t`Sent ${nativeTokenSymbol}`,
  }
}
