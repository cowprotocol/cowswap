import { TokenWithLogo } from '@cowprotocol/common-const'
import { Currency, CurrencyAmount } from '@cowprotocol/currency'

import { SerializedToken } from '../../user/types'
import { Order, OrderStatus, SerializedBridgeOutputAmount } from '../actions'
import { OrderObject, V2OrderObject } from '../reducer'
import { isOrderExpired } from '../utils'

export function deserializeOrder(orderObject: OrderObject | V2OrderObject | undefined): Order | undefined {
  let order: Order | undefined
  // we need to make sure the incoming order is a valid
  // V3 typed order as users can have stale data from V2
  if (isV3Order(orderObject)) {
    const { order: serialisedOrder } = orderObject

    const deserialisedInputToken = deserializeToken(serialisedOrder.inputToken)
    const deserialisedOutputToken = deserializeToken(serialisedOrder.outputToken)
    const deserialisedBridgeOutputAmount = deserializeBridgeOutputAmount(
      serialisedOrder.bridgeOutputAmount,
      deserialisedOutputToken,
    )

    order = {
      ...serialisedOrder,
      bridgeOutputAmount: deserialisedBridgeOutputAmount,
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

function deserializeBridgeOutputAmount(
  serializedAmount: SerializedBridgeOutputAmount | unknown,
  outputToken: TokenWithLogo,
): CurrencyAmount<Currency> | undefined {
  if (typeof serializedAmount === 'string') {
    return CurrencyAmount.fromRawAmount(outputToken, serializedAmount)
  }

  if (isSerializedBridgeOutputAmount(serializedAmount)) {
    return CurrencyAmount.fromRawAmount(outputToken, serializedAmount.amount)
  }

  return undefined
}

function isSerializedBridgeOutputAmount(value: unknown): value is SerializedBridgeOutputAmount {
  return (
    typeof value === 'object' &&
    value !== null &&
    'amount' in value &&
    typeof (value as { amount: unknown }).amount === 'string'
  )
}

// TODO: Replace any with proper type definitions
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function isV3Order(orderObject: any): orderObject is OrderObject {
  return orderObject?.order?.inputToken !== undefined || orderObject?.order?.outputToken !== undefined
}
