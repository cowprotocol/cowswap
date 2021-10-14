import { SupportedChainId as ChainId } from 'constants/chains'
import { useCallback, useMemo, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { AppDispatch, AppState } from 'state'
import {
  addPendingOrder,
  removeOrder,
  clearOrders,
  fulfillOrder,
  expireOrder,
  cancelOrder,
  requestOrderCancellation,
  updateLastCheckedBlock,
  SerializedOrder,
  fulfillOrdersBatch,
  FulfillOrdersBatchParams,
  expireOrdersBatch,
  cancelOrdersBatch,
  Order,
  setIsOrderUnfillable,
  SetIsOrderUnfillableParams,
  preSignOrders,
} from './actions'
import {
  getDefaultNetworkState,
  OrderObject,
  OrdersState,
  OrdersStateNetwork,
  ORDERS_LIST,
  OrderTypeKeys,
  ORDER_LIST_KEYS,
  PartialOrdersMap,
  V2OrderObject,
} from './reducer'
import { isTruthy } from 'utils/misc'
import { OrderID } from 'api/gnosisProtocol'
import { ContractDeploymentBlocks } from './consts'
import { deserializeToken, serializeToken } from '@src/state/user/hooks'

export interface AddUnserialisedPendingOrderParams extends GetRemoveOrderParams {
  order: Order
}

interface AddPendingOrderParams extends GetRemoveOrderParams {
  order: SerializedOrder
}

interface FulfillOrderParams extends GetRemoveOrderParams {
  fulfillmentTime: string
  transactionHash: string
}
interface GetRemoveOrderParams {
  id: OrderID
  chainId: ChainId
}
type GetOrdersByIdParams = {
  ids: OrderID[]
  chainId?: ChainId
}

type GetOrdersParams = Partial<Pick<GetRemoveOrderParams, 'chainId'>>
type ClearOrdersParams = Pick<GetRemoveOrderParams, 'chainId'>
type GetLastCheckedBlockParams = GetOrdersParams
type ExpireOrderParams = GetRemoveOrderParams
type CancelOrderParams = GetRemoveOrderParams
interface UpdateOrdersBatchParams {
  ids: OrderID[]
  chainId: ChainId
}

type ExpireOrdersBatchParams = UpdateOrdersBatchParams
type CancelOrdersBatchParams = UpdateOrdersBatchParams
type PresignOrdersParams = UpdateOrdersBatchParams

interface UpdateLastCheckedBlockParams extends ClearOrdersParams {
  lastCheckedBlock: number
}

export type AddOrderCallback = (addOrderParams: AddUnserialisedPendingOrderParams) => void
type RemoveOrderCallback = (removeOrderParams: GetRemoveOrderParams) => void
type FulfillOrderCallback = (fulfillOrderParams: FulfillOrderParams) => void
type FulfillOrdersBatchCallback = (fulfillOrdersBatchParams: FulfillOrdersBatchParams) => void
type ExpireOrderCallback = (fulfillOrderParams: ExpireOrderParams) => void
type ExpireOrdersBatchCallback = (expireOrdersBatchParams: ExpireOrdersBatchParams) => void
type CancelOrderCallback = (cancelOrderParams: CancelOrderParams) => void
type CancelOrdersBatchCallback = (cancelOrdersBatchParams: CancelOrdersBatchParams) => void
type PresignOrdersCallback = (fulfillOrderParams: PresignOrdersParams) => void
type ClearOrdersCallback = (clearOrdersParams: ClearOrdersParams) => void
type UpdateLastCheckedBlockCallback = (updateLastCheckedBlockParams: UpdateLastCheckedBlockParams) => void
type SetIsOrderUnfillable = (params: SetIsOrderUnfillableParams) => void

type GetOrderByIdCallback = (id: OrderID) => SerializedOrder | undefined

function _concatOrdersState(state: OrdersStateNetwork, keys: OrderTypeKeys[]) {
  if (!state) return []

  const firstState = state[keys[0]] || {}
  const restKeys = keys.slice(1)

  return restKeys.reduce((acc, nextKey) => {
    const nextState = Object.values(state[nextKey] || {})
    return acc.concat(nextState)
  }, Object.values(firstState))
}

function _isV3Order(orderObject: any): orderObject is OrderObject {
  return orderObject?.order?.inputToken !== undefined || orderObject?.order?.outputToken !== undefined
}

function _deserializeOrder(orderObject: OrderObject | V2OrderObject | undefined) {
  let order: Order | undefined
  // we need to make sure the incoming order is a valid
  // V3 typed order as users can have stale data from V2
  if (_isV3Order(orderObject)) {
    const { order: serialisedOrder } = orderObject

    const deserialisedInputToken = deserializeToken(serialisedOrder.inputToken)
    const deserialisedOutputToken = deserializeToken(serialisedOrder.outputToken)
    order = {
      ...serialisedOrder,
      inputToken: deserialisedInputToken,
      outputToken: deserialisedOutputToken,
    }
  } else {
    orderObject?.order &&
      console.debug('[Order::hooks] - V2 Order detected, skipping serialisation.', orderObject.order)
  }

  return order
}

export const useOrder = ({ id, chainId }: Partial<GetRemoveOrderParams>): Order | undefined => {
  return useSelector<AppState, Order | undefined>((state) => {
    if (!id || !chainId) return undefined

    const ordersState = state.orders[chainId]
    const orders = { ...ORDERS_LIST, ...ordersState }

    const serialisedOrder =
      orders?.fulfilled[id] ||
      orders?.pending[id] ||
      orders?.expired[id] ||
      orders?.presignaturePending[id] ||
      orders?.cancelled[id]

    return _deserializeOrder(serialisedOrder)
  })
}

function useOrdersStateNetwork(chainId: ChainId | undefined): OrdersStateNetwork | undefined {
  return useSelector<AppState, OrdersState[ChainId] | undefined>((state) => {
    if (!chainId) {
      return undefined
    }
    const ordersState = state.orders?.[chainId] || {}
    return { ...getDefaultNetworkState(chainId), ...ordersState }
  })
}

// used to extract Order.summary before showing popup
// TODO: put the whole logic inside Popup middleware
export const useFindOrderById = ({ chainId }: GetOrdersParams): GetOrderByIdCallback => {
  const state = useOrdersStateNetwork(chainId)

  // stable ref, so we don't recreate the function
  const stateRef = useRef(state)
  stateRef.current = state

  // stable ref so that we don't refresh useEffect too much
  // as we need to get an order lazily before creating a popup only
  return useCallback(
    (id: OrderID) => {
      if (!chainId || !stateRef.current) return

      const orders = { ...ORDERS_LIST, ...stateRef.current }

      const serialisedOrderObject =
        orders.fulfilled[id] || orders.pending[id] || orders.expired[id] || orders.cancelled[id]

      return _deserializeOrder(serialisedOrderObject)
    },
    [chainId]
  )
}

export const useOrders = ({ chainId }: GetOrdersParams): Order[] => {
  const state = useOrdersStateNetwork(chainId)

  return useMemo(() => {
    if (!state) return []

    const allOrders = _concatOrdersState(state, ORDER_LIST_KEYS).map(_deserializeOrder).filter(isTruthy)

    return allOrders
  }, [state])
}

export const useAllOrders = ({ chainId }: GetOrdersParams): PartialOrdersMap => {
  const state = useOrdersStateNetwork(chainId)

  return useMemo(() => {
    if (!state) return {}

    return {
      ...state.pending,
      ...state.presignaturePending,
      ...state.fulfilled,
      ...state.expired,
      ...state.cancelled,
    }
  }, [state])
}

type OrdersMap = {
  [id: string]: Order
}

export const useOrdersById = ({ chainId, ids }: GetOrdersByIdParams): OrdersMap => {
  const allOrders = useAllOrders({ chainId })

  return useMemo(() => {
    if (!allOrders || !ids) {
      return {}
    }

    return ids.reduce<OrdersMap>((acc, id) => {
      const order = _deserializeOrder(allOrders[id])
      if (order) {
        acc[id] = order
      }
      return acc
    }, {})
  }, [allOrders, ids])
}

export const usePendingOrders = ({ chainId }: GetOrdersParams): Order[] => {
  const state = useSelector<AppState, { pending: PartialOrdersMap; presignaturePending: PartialOrdersMap } | undefined>(
    (state) => {
      const ordersState = chainId && state.orders?.[chainId]
      if (!ordersState) {
        return
      }

      return { pending: ordersState.pending || {}, presignaturePending: ordersState.presignaturePending || {} }
    }
  )

  return useMemo(() => {
    if (!state) return []

    const { pending, presignaturePending } = state
    const allPending = Object.values(pending).concat(Object.values(presignaturePending))

    return allPending.map(_deserializeOrder).filter(isTruthy)
  }, [state])
}

export const useFulfilledOrders = ({ chainId }: GetOrdersParams): Order[] => {
  const state = useSelector<AppState, PartialOrdersMap | undefined>(
    (state) => chainId && state.orders?.[chainId]?.fulfilled
  )

  return useMemo(() => {
    if (!state) return []

    return Object.values(state).map(_deserializeOrder).filter(isTruthy)
  }, [state])
}

export const useExpiredOrders = ({ chainId }: GetOrdersParams): Order[] => {
  const state = useSelector<AppState, PartialOrdersMap | undefined>(
    (state) => chainId && state.orders?.[chainId]?.expired
  )

  return useMemo(() => {
    if (!state) return []

    return Object.values(state).map(_deserializeOrder).filter(isTruthy)
  }, [state])
}

export const useCancelledOrders = ({ chainId }: GetOrdersParams): Order[] => {
  const state = useSelector<AppState, PartialOrdersMap | undefined>(
    (state) => chainId && state.orders?.[chainId]?.cancelled
  )

  return useMemo(() => {
    if (!state) return []

    return Object.values(state).map(_deserializeOrder).filter(isTruthy)
  }, [state])
}

export const useAddPendingOrder = (): AddOrderCallback => {
  const dispatch = useDispatch<AppDispatch>()
  return useCallback(
    (addOrderParams: AddUnserialisedPendingOrderParams) => {
      const serialisedSellToken = serializeToken(addOrderParams.order.inputToken)
      const serialisedBuyToken = serializeToken(addOrderParams.order.outputToken)
      const order: SerializedOrder = {
        ...addOrderParams.order,
        inputToken: serialisedSellToken,
        outputToken: serialisedBuyToken,
      }
      const params: AddPendingOrderParams = {
        ...addOrderParams,
        order,
      }
      return dispatch(addPendingOrder(params))
    },
    [dispatch]
  )
}

// unused except in mock
export const useFulfillOrder = (): FulfillOrderCallback => {
  const dispatch = useDispatch<AppDispatch>()
  return useCallback((fulfillOrderParams: FulfillOrderParams) => dispatch(fulfillOrder(fulfillOrderParams)), [dispatch])
}

export const useFulfillOrdersBatch = (): FulfillOrdersBatchCallback => {
  const dispatch = useDispatch<AppDispatch>()
  return useCallback(
    (fulfillOrdersBatchParams: FulfillOrdersBatchParams) => dispatch(fulfillOrdersBatch(fulfillOrdersBatchParams)),
    [dispatch]
  )
}

export const usePresignOrders = (): PresignOrdersCallback => {
  const dispatch = useDispatch<AppDispatch>()
  return useCallback((params: PresignOrdersParams) => dispatch(preSignOrders(params)), [dispatch])
}

export const useExpireOrder = (): ExpireOrderCallback => {
  const dispatch = useDispatch<AppDispatch>()
  return useCallback((expireOrderParams: ExpireOrderParams) => dispatch(expireOrder(expireOrderParams)), [dispatch])
}

export const useExpireOrdersBatch = (): ExpireOrdersBatchCallback => {
  const dispatch = useDispatch<AppDispatch>()
  return useCallback(
    (expireOrdersBatchParams: ExpireOrdersBatchParams) => dispatch(expireOrdersBatch(expireOrdersBatchParams)),
    [dispatch]
  )
}

export const useCancelPendingOrder = (): CancelOrderCallback => {
  const dispatch = useDispatch<AppDispatch>()
  return useCallback((cancelOrderParams: CancelOrderParams) => dispatch(cancelOrder(cancelOrderParams)), [dispatch])
}

export const useCancelOrdersBatch = (): CancelOrdersBatchCallback => {
  const dispatch = useDispatch<AppDispatch>()
  return useCallback(
    (cancelOrdersBatchParams: CancelOrdersBatchParams) => dispatch(cancelOrdersBatch(cancelOrdersBatchParams)),
    [dispatch]
  )
}

export const useRequestOrderCancellation = (): CancelOrderCallback => {
  const dispatch = useDispatch<AppDispatch>()
  return useCallback(
    (cancelOrderParams: CancelOrderParams) => dispatch(requestOrderCancellation(cancelOrderParams)),
    [dispatch]
  )
}

export const useRemoveOrder = (): RemoveOrderCallback => {
  const dispatch = useDispatch<AppDispatch>()
  return useCallback((removeOrderParams: GetRemoveOrderParams) => dispatch(removeOrder(removeOrderParams)), [dispatch])
}

export const useClearOrders = (): ClearOrdersCallback => {
  const dispatch = useDispatch<AppDispatch>()
  return useCallback((clearOrdersParams: ClearOrdersParams) => dispatch(clearOrders(clearOrdersParams)), [dispatch])
}

export const useLastCheckedBlock = ({ chainId }: GetLastCheckedBlockParams): number => {
  return useSelector<AppState, number>((state) => {
    if (!chainId) return 0

    return state.orders?.[chainId]?.lastCheckedBlock ?? ContractDeploymentBlocks[chainId] ?? 0
  })
}

export const useUpdateLastCheckedBlock = (): UpdateLastCheckedBlockCallback => {
  const dispatch = useDispatch<AppDispatch>()
  return useCallback(
    (updateLastCheckedBlockParams: UpdateLastCheckedBlockParams) =>
      dispatch(updateLastCheckedBlock(updateLastCheckedBlockParams)),
    [dispatch]
  )
}

export const useSetIsOrderUnfillable = (): SetIsOrderUnfillable => {
  const dispatch = useDispatch<AppDispatch>()
  return useCallback((params: SetIsOrderUnfillableParams) => dispatch(setIsOrderUnfillable(params)), [dispatch])
}
