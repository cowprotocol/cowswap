import {
  EthFlowStepper as Pure,
  EthFlowStepperProps as PureProps,
  SmartOrderStatus,
} from '@cow/modules/swap/pure/EthFlow/EthFlowStepper'
import { useDetectNativeToken } from '@cow/modules/swap/hooks/useDetectNativeToken'
import { Order } from 'state/orders/actions'
import { NATIVE_CURRENCY_BUY_ADDRESS } from 'constants/index'
import { safeTokenName } from '@cowprotocol/cow-js'

type EthFlowStepperProps = {
  order: Order | undefined
}

export function EthFlowStepper(props: EthFlowStepperProps) {
  const { order } = props
  const { native } = useDetectNativeToken()

  const state = mapOrderToEthFlowStepperState(order)
  const isEthFlowOrder = getIsEthFlowOrder(order)

  if (!order || !state || !isEthFlowOrder) {
    return null
  }

  const stepperProps: PureProps = {
    nativeTokenSymbol: native.symbol as string,
    tokenLabel: safeTokenName(order.outputToken),
    order: {
      // The creation hash is only available in the device where the order is placed
      createOrderTx: order.orderCreationHash || '',
      orderId: order.id,
      state,
      isExpired: order.status === 'expired',
      // rejectedReason?: TODO: address when dealing with rejections
    },
    // TODO: fill these in when dealing with rejections
    refund: {
      // refundTx?: string
      isRefunded: false,
    },
    // TODO: fill these in when dealing with cancellations
    cancelation: {
      // cancelationTx?: string
      isCanceled: false,
    },
  }

  return <Pure {...stepperProps} />
}

function mapOrderToEthFlowStepperState(order: Order | undefined): SmartOrderStatus | undefined {
  // NOTE: not returning `CREATED` as we currently don't track the initial tx execution
  if (!order) {
    return
  } else if (order.status === 'creating') {
    return SmartOrderStatus.CREATING
  } else if (order.status === 'pending') {
    return SmartOrderStatus.INDEXED
  } else if (order.status === 'fulfilled') {
    return SmartOrderStatus.FILLED
  }
  return
}

// TODO: move this somewhere else?
function getIsEthFlowOrder(order: Order | undefined): boolean | undefined {
  return order?.inputToken.address === NATIVE_CURRENCY_BUY_ADDRESS
}
