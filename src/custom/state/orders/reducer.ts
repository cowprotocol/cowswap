import { createReducer, PayloadAction } from '@reduxjs/toolkit'
import { OrderID } from 'utils/operator'
import { ChainId } from '@uniswap/sdk'
import { addPendingOrder, removeOrder, Order, clearOrders, fulfillOrder, OrderStatus } from './actions'

export interface OrderObject {
  id: OrderID
  order: Order
}

// {order uuid => OrderObject} mapping
type OrdersMap = Record<OrderID, OrderObject>
export type PartialOrdersMap = Partial<OrdersMap>

export type OrdersState = {
  readonly [chainId in ChainId]?: {
    pending: PartialOrdersMap
    fulfilled: PartialOrdersMap
  }
}

interface PrefillStateRequired {
  chainId: ChainId
}

type Writable<T> = {
  -readonly [K in keyof T]: T[K]
}

// makes sure there's always an object at state[chainId], state[chainId].pending | .fulfilled
function prefillState(
  state: Writable<OrdersState>,
  { payload: { chainId } }: PayloadAction<PrefillStateRequired>
): asserts state is Required<OrdersState> {
  // asserts that state[chainId].pending | .fulfilled is ok to access
  const stateAtChainId = state[chainId]

  if (!stateAtChainId) {
    state[chainId] = {
      pending: {},
      fulfilled: {}
    }
    return
  }

  if (!stateAtChainId.pending) {
    stateAtChainId.pending = {}
  }

  if (!stateAtChainId.fulfilled) {
    stateAtChainId.fulfilled = {}
  }
}

const initialState: OrdersState = {}

export default createReducer(initialState, builder =>
  builder
    .addCase(addPendingOrder, (state, action) => {
      prefillState(state, action)
      const { order, id, chainId } = action.payload

      state[chainId].pending[id] = { order, id }
    })
    .addCase(removeOrder, (state, action) => {
      prefillState(state, action)
      const { id, chainId } = action.payload
      delete state[chainId].pending[id]
      delete state[chainId].fulfilled[id]
    })
    .addCase(fulfillOrder, (state, action) => {
      prefillState(state, action)
      const { id, chainId, fulfillmentTime } = action.payload

      const orderObject = state[chainId].pending[id]

      if (orderObject) {
        delete state[chainId].pending[id]

        orderObject.order.status = OrderStatus.FULFILLED
        orderObject.order.fulfillmentTime = fulfillmentTime

        state[chainId].fulfilled[id] = orderObject
      }
    })
    .addCase(clearOrders, (state, action) => {
      const { chainId } = action.payload

      state[chainId] = {
        pending: {},
        fulfilled: {}
      }
    })
)
