import { SupportedChainId as ChainId } from '@cowprotocol/cow-sdk'
import { useCallback, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { AppDispatch, AppState } from 'state'
import {
  addOrUpdateOrders,
  AddOrUpdateOrdersParams,
  addPendingOrder,
  cancelOrdersBatch,
  expireOrdersBatch,
  fulfillOrdersBatch,
  FulfillOrdersBatchParams,
  Order,
  preSignOrders,
  requestOrderCancellation,
  SerializedOrder,
  SetIsOrderRefundedBatch,
  setIsOrderRefundedBatch,
  setIsOrderUnfillable,
  SetIsOrderUnfillableParams,
  setOrderCancellationHash,
  updatePresignGnosisSafeTx,
  UpdatePresignGnosisSafeTxParams,
} from './actions'
import {
  getDefaultNetworkState,
  ORDER_LIST_KEYS,
  OrderObject,
  ORDERS_LIST,
  OrdersState,
  OrdersStateNetwork,
  OrderTypeKeys,
  PartialOrdersMap,
  V2OrderObject,
} from './reducer'
import { isTruthy } from 'utils/misc'
import { OrderID } from '@cow/api/gnosisProtocol'
import { deserializeToken, serializeToken } from 'state/user/hooks'

export interface AddOrUpdateUnserialisedOrdersParams extends Omit<AddOrUpdateOrdersParams, 'orders'> {
  orders: Order[]
}

export interface AddUnserialisedPendingOrderParams extends GetRemoveOrderParams {
  order: Order
}

interface AddPendingOrderParams extends GetRemoveOrderParams {
  order: SerializedOrder
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
type CancelOrderParams = GetRemoveOrderParams
type SetOrderCancellationHashParams = CancelOrderParams & { hash: string }

interface UpdateOrdersBatchParams {
  ids: OrderID[]
  chainId: ChainId
}

type ExpireOrdersBatchParams = UpdateOrdersBatchParams
type CancelOrdersBatchParams = UpdateOrdersBatchParams
type PresignOrdersParams = UpdateOrdersBatchParams

export type AddOrUpdateOrdersCallback = (params: AddOrUpdateUnserialisedOrdersParams) => void
export type AddOrderCallback = (addOrderParams: AddUnserialisedPendingOrderParams) => void
export type FulfillOrdersBatchCallback = (fulfillOrdersBatchParams: FulfillOrdersBatchParams) => void
export type ExpireOrdersBatchCallback = (expireOrdersBatchParams: ExpireOrdersBatchParams) => void
export type CancelOrderCallback = (cancelOrderParams: CancelOrderParams) => void
export type SetOrderCancellationHashCallback = (setOrderCancellationHashParams: SetOrderCancellationHashParams) => void
export type CancelOrdersBatchCallback = (cancelOrdersBatchParams: CancelOrdersBatchParams) => void
export type PresignOrdersCallback = (fulfillOrderParams: PresignOrdersParams) => void
export type UpdatePresignGnosisSafeTxCallback = (
  updatePresignGnosisSafeTxParams: UpdatePresignGnosisSafeTxParams
) => void
export type SetIsOrderUnfillable = (params: SetIsOrderUnfillableParams) => void
export type SetIsOrderRefundedBatchCallback = (params: SetIsOrderRefundedBatch) => void

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
      orders?.cancelled[id] ||
      orders?.creating[id] ||
      orders?.failed[id]

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
      ...state.creating,
      ...state.failed,
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

export const useCombinedPendingOrders = ({ chainId }: GetOrdersParams): Order[] => {
  const state = useSelector<
    AppState,
    | {
        pending: PartialOrdersMap
        presignaturePending: PartialOrdersMap
        creating: PartialOrdersMap
      }
    | undefined
  >((state) => {
    const ordersState = chainId && state.orders?.[chainId]
    if (!ordersState) {
      return
    }

    return {
      pending: ordersState.pending || {},
      presignaturePending: ordersState.presignaturePending || {},
      creating: ordersState.creating || {},
    }
  })

  return useMemo(() => {
    if (!state) return []

    const { pending, presignaturePending, creating } = state
    const allPending = Object.values(pending).concat(Object.values(presignaturePending)).concat(Object.values(creating))

    return allPending.map(_deserializeOrder).filter(isTruthy)
  }, [state])
}

/**
 * Use ONLY OrderStatus.PENDING orders
 *
 * Similar to usePendingOrders
 *
 * The difference is that this hook returns only orders that have the status PENDING
 * while usePendingOrders aggregates all pending states
 * @param chainId
 */
export const useOnlyPendingOrders = ({ chainId }: GetOrdersParams): Order[] => {
  const state = useSelector<AppState, PartialOrdersMap | undefined>(
    (state) => chainId && state.orders?.[chainId]?.pending
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

export const useExpiredOrders = ({ chainId }: GetOrdersParams): Order[] => {
  const state = useSelector<AppState, PartialOrdersMap | undefined>(
    (state) => chainId && state.orders?.[chainId]?.expired
  )

  return useMemo(() => {
    if (!state) return []

    return Object.values(state).map(_deserializeOrder).filter(isTruthy)
  }, [state])
}

export const useAddOrUpdateOrders = (): AddOrUpdateOrdersCallback => {
  const dispatch = useDispatch<AppDispatch>()
  return useCallback(
    (params: AddOrUpdateUnserialisedOrdersParams) => {
      const orders = params.orders.map((order) => ({
        ...order,
        inputToken: serializeToken(order.inputToken),
        outputToken: serializeToken(order.outputToken),
      }))
      dispatch(addOrUpdateOrders({ ...params, orders }))
    },
    [dispatch]
  )
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

export const useUpdatePresignGnosisSafeTx = (): UpdatePresignGnosisSafeTxCallback => {
  const dispatch = useDispatch<AppDispatch>()
  return useCallback(
    (params: UpdatePresignGnosisSafeTxParams) => dispatch(updatePresignGnosisSafeTx(params)),
    [dispatch]
  )
}

export const useExpireOrdersBatch = (): ExpireOrdersBatchCallback => {
  const dispatch = useDispatch<AppDispatch>()
  return useCallback(
    (expireOrdersBatchParams: ExpireOrdersBatchParams) => dispatch(expireOrdersBatch(expireOrdersBatchParams)),
    [dispatch]
  )
}

export const useCancelOrdersBatch = (): CancelOrdersBatchCallback => {
  const dispatch = useDispatch<AppDispatch>()
  return useCallback(
    (cancelOrdersBatchParams: CancelOrdersBatchParams) => dispatch(cancelOrdersBatch(cancelOrdersBatchParams)),
    [dispatch]
  )
}

export const useSetOrderCancellationHash = (): SetOrderCancellationHashCallback => {
  const dispatch = useDispatch<AppDispatch>()
  return useCallback((params: SetOrderCancellationHashParams) => dispatch(setOrderCancellationHash(params)), [dispatch])
}

export const useRequestOrderCancellation = (): CancelOrderCallback => {
  const dispatch = useDispatch<AppDispatch>()
  return useCallback(
    (cancelOrderParams: CancelOrderParams) => dispatch(requestOrderCancellation(cancelOrderParams)),
    [dispatch]
  )
}

export const useSetIsOrderUnfillable = (): SetIsOrderUnfillable => {
  const dispatch = useDispatch<AppDispatch>()
  return useCallback((params: SetIsOrderUnfillableParams) => dispatch(setIsOrderUnfillable(params)), [dispatch])
}

export const useSetIsOrderRefundedBatch = (): SetIsOrderRefundedBatchCallback => {
  const dispatch = useDispatch<AppDispatch>()
  return useCallback((params: SetIsOrderRefundedBatch) => dispatch(setIsOrderRefundedBatch(params)), [dispatch])
}
