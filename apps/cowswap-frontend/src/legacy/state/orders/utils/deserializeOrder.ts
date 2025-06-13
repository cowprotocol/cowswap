import { TokenWithLogo } from '@cowprotocol/common-const'

import { SerializedToken } from '../../user/types'
import { Order, OrderStatus } from '../actions'
import { OrderObject, V2OrderObject } from '../reducer'
import { isOrderExpired } from '../utils'

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function deserializeOrder(orderObject: OrderObject | V2OrderObject | undefined) {
  let order: Order | undefined
  // we need to make sure the incoming order is a valid
  // V3 typed order as users can have stale data from V2
  if (isV3Order(orderObject)) {
    const { order: serialisedOrder } = orderObject

    const deserialisedInputToken = deserializeToken(serialisedOrder.inputToken)
    const deserialisedOutputToken = deserializeToken(serialisedOrder.outputToken)
    order = {
      ...serialisedOrder,
      inputToken: deserialisedInputToken,
      outputToken: deserialisedOutputToken,
    }

    // Fix for edge-case, where for some reason the order is still pending but its actually expired
    if (order.status === OrderStatus.PENDING && isOrderExpired(order)) {
      order.status = OrderStatus.EXPIRED
    }
  } else {
    orderObject?.order &&
      console.debug('[Order::hooks] - V2 Order detected, skipping serialisation.', orderObject.order)
  }

  return order
}

function deserializeToken(serializedToken: SerializedToken): TokenWithLogo {
  return TokenWithLogo.fromToken(serializedToken, serializedToken.logoURI)
}

// TODO: Replace any with proper type definitions
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function isV3Order(orderObject: any): orderObject is OrderObject {
  return orderObject?.order?.inputToken !== undefined || orderObject?.order?.outputToken !== undefined
}
