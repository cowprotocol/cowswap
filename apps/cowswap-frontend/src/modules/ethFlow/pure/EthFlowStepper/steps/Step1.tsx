import Checkmark from '@cowprotocol/assets/cow-swap/checkmark.svg'
import Exclamation from '@cowprotocol/assets/cow-swap/exclamation.svg'
import Send from '@cowprotocol/assets/cow-swap/send.svg'
import X from '@cowprotocol/assets/cow-swap/x.svg'

import { EthFlowStepperProps, SmartOrderStatus } from '../index'
import { StatusIconState } from '../StatusIcon'
import { ExplorerLinkStyled, Step } from '../Step'

interface Step1Config {
  icon: string
  state: StatusIconState
  label: string
}

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function Step1(props: EthFlowStepperProps) {
  const {
    creation: { hash, replaced },
  } = props

  const { label, state, icon } = getStepConfig(props)

  return (
    <Step state={state} icon={icon} label={label}>
      {hash && !replaced && <ExplorerLinkStyled type="transaction" label="View transaction" id={hash} />}
    </Step>
  )
}

function getStepConfig({ order, creation, nativeTokenSymbol }: EthFlowStepperProps): Step1Config {
  const { failed, cancelled, replaced } = creation

  const isFilled = order.state === SmartOrderStatus.FILLED
  const isCreating = order.state === SmartOrderStatus.CREATING

  if ((failed || cancelled || (replaced && isCreating)) && !isFilled) {
    return {
      icon: X,
      state: 'error',
      label: 'Transaction ' + (failed ? 'failed' : cancelled ? 'cancelled' : 'replaced'),
    }
  }

  if (isCreating) {
    if (order.isExpired) {
      return {
        icon: Exclamation,
        state: 'error',
        label: 'Order Expired',
      }
    }

    return {
      icon: Send,
      state: 'pending',
      label: 'Sending ' + nativeTokenSymbol,
    }
  }

  return {
    icon: Checkmark,
    state: 'success',
    label: 'Sent ' + nativeTokenSymbol,
  }
}
