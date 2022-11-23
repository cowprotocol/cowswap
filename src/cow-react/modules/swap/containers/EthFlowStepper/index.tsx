import {
  EthFlowStepper as Pure,
  EthFlowStepperProps,
  SmartOrderStatus,
} from '@cow/modules/swap/pure/EthFlow/EthFlowStepper'
import { useDetectNativeToken } from '@cow/modules/swap/hooks/useDetectNativeToken'
import { Order } from 'state/orders/actions'
import { NATIVE_CURRENCY_BUY_ADDRESS } from 'constants/index'

type Props = {
  storeOrder: Order | undefined
}

export function EthFlowStepper(props: Props) {
  const { storeOrder } = props
  const { native } = useDetectNativeToken()

  const state = mapOrderToEthFlowStepperState(storeOrder)
  const isEthFlowOrder = getIsEthFlowOrder(storeOrder)

  if (!storeOrder || !state || !isEthFlowOrder) {
    return null
  }

  const stepperProps: EthFlowStepperProps = {
    nativeTokenSymbol: native.symbol as string,
    tokenLabel: storeOrder.outputToken.symbol as string,
    order: {
      // The creation hash is only available in the device where the order is placed
      createOrderTx: storeOrder.orderCreationHash || '',
      orderId: storeOrder.id,
      state,
      isExpired: storeOrder.status === 'expired',
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
