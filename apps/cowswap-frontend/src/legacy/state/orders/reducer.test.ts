import { USDC_MAINNET as USDC, USDT } from '@cowprotocol/common-const'
import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { addOrUpdateOrders, OrderStatus, SerializedOrder } from './actions'
import { generateOrder } from './mocks'
import reducer from './reducer'

import { serializeToken } from '../user/hooks'

const CHAIN_ID = SupportedChainId.MAINNET

function createSerializedOrder(status: OrderStatus): SerializedOrder {
  const order = generateOrder({ owner: '0x1111111111111111111111111111111111111111', sellToken: USDT, buyToken: USDC })

  return {
    ...order,
    status,
    inputToken: serializeToken(order.inputToken),
    outputToken: serializeToken(order.outputToken),
  }
}

describe('orders reducer', () => {
  it('reclassifies a locally cancelled order to fulfilled when the API catches up', () => {
    const cancelledOrder = createSerializedOrder(OrderStatus.CANCELLED)
    const fulfilledOrder = { ...cancelledOrder, status: OrderStatus.FULFILLED }

    const cancelledState = reducer(
      undefined,
      addOrUpdateOrders({ chainId: CHAIN_ID, orders: [cancelledOrder], isSafeWallet: false }),
    )
    const nextState = reducer(
      cancelledState,
      addOrUpdateOrders({ chainId: CHAIN_ID, orders: [fulfilledOrder], isSafeWallet: false }),
    )

    expect(nextState[CHAIN_ID]?.cancelled[cancelledOrder.id]).toBeUndefined()
    expect(nextState[CHAIN_ID]?.fulfilled[cancelledOrder.id]?.order.status).toBe(OrderStatus.FULFILLED)
  })

  it('keeps a locally cancelled order cancelled while the API still reports a pending state', () => {
    const cancelledOrder = createSerializedOrder(OrderStatus.CANCELLED)
    const pendingOrder = { ...cancelledOrder, status: OrderStatus.PENDING }

    const cancelledState = reducer(
      undefined,
      addOrUpdateOrders({ chainId: CHAIN_ID, orders: [cancelledOrder], isSafeWallet: false }),
    )
    const nextState = reducer(
      cancelledState,
      addOrUpdateOrders({ chainId: CHAIN_ID, orders: [pendingOrder], isSafeWallet: false }),
    )

    expect(nextState[CHAIN_ID]?.pending[cancelledOrder.id]).toBeUndefined()
    expect(nextState[CHAIN_ID]?.cancelled[cancelledOrder.id]?.order.status).toBe(OrderStatus.CANCELLED)
  })

  it('promotes a stale cancelled order when apiAdditionalInfo already proves it was fulfilled', () => {
    const cancelledOrder = createSerializedOrder(OrderStatus.CANCELLED)
    const staleIncomingOrder = {
      ...cancelledOrder,
      status: OrderStatus.CANCELLED,
      apiAdditionalInfo: {
        creationDate: cancelledOrder.creationTime,
        uid: cancelledOrder.id,
        validTo: Number(cancelledOrder.validTo),
        invalidated: true,
        buyAmount: cancelledOrder.buyAmount,
        sellAmount: cancelledOrder.sellAmount,
        executedBuyAmount: cancelledOrder.buyAmount,
        executedSellAmountBeforeFees: cancelledOrder.sellAmount,
        kind: cancelledOrder.kind,
        signingScheme: cancelledOrder.signingScheme,
        status: 'fulfilled',
      },
    }

    const cancelledState = reducer(
      undefined,
      addOrUpdateOrders({ chainId: CHAIN_ID, orders: [cancelledOrder], isSafeWallet: false }),
    )
    const nextState = reducer(
      cancelledState,
      addOrUpdateOrders({ chainId: CHAIN_ID, orders: [staleIncomingOrder as SerializedOrder], isSafeWallet: false }),
    )

    expect(nextState[CHAIN_ID]?.cancelled[cancelledOrder.id]).toBeUndefined()
    expect(nextState[CHAIN_ID]?.fulfilled[cancelledOrder.id]?.order.status).toBe(OrderStatus.FULFILLED)
  })
})
