import {
  EthFlowStepper as Pure,
  EthFlowStepperProps as PureProps,
  SmartOrderStatus,
} from '@cow/modules/swap/pure/EthFlow/EthFlowStepper'
import { useDetectNativeToken } from '@cow/modules/swap/hooks/useDetectNativeToken'
import { Order, OrderStatus } from 'state/orders/actions'
import { NATIVE_CURRENCY_BUY_ADDRESS } from 'constants/index'
import { safeTokenName } from '@cowprotocol/cow-js'
import { isOrderExpired } from 'state/orders/utils'

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
      isExpired: isEthFlowOrderExpired(order),
      // rejectedReason?: TODO: address when dealing with rejections
    },
    // TODO: fill these in when dealing with rejections
    refund: {
      // refundTx?: string
      isRefunded: false,
    },
    cancellation: {
      cancellationTx: order.cancellationHash,
      //  TODO: wire this up also with the cancellation tx once that's implemented
      isCancelled: order.status === 'cancelled',
    },
  }

  return <Pure {...stepperProps} />
}

const ORDER_INDEXED_STATUSES: OrderStatus[] = [OrderStatus.PENDING, OrderStatus.EXPIRED, OrderStatus.CANCELLED]

function mapOrderToEthFlowStepperState(order: Order | undefined): SmartOrderStatus | undefined {
  // NOTE: not returning `CREATED` as we currently don't track the initial tx execution

  if (order) {
    const { status } = order

    if (status === 'creating') {
      return SmartOrderStatus.CREATING
    } else if (ORDER_INDEXED_STATUSES.includes(status)) {
      return SmartOrderStatus.INDEXED
    } else if (status === 'fulfilled') {
      return SmartOrderStatus.FILLED
    }
  }
  return undefined
}

function isEthFlowOrderExpired(order: Order | undefined): boolean {
  return order?.status === 'expired' || isOrderExpired({ validTo: order?.validTo as number })
}

// TODO: move this somewhere else?
export function getIsEthFlowOrder(order: Order | undefined): boolean {
  return order?.inputToken.address === NATIVE_CURRENCY_BUY_ADDRESS
}
