import { useCallback, useMemo } from 'react'

import { TokenWithLogo } from '@cowprotocol/common-const'
import { isTruthy } from '@cowprotocol/common-utils'
import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { useDispatch, useSelector } from 'react-redux'

import { getUiOrderType, UiOrderType } from 'utils/orderUtils/getUiOrderType'

import {
  addOrUpdateOrders,
  AddOrUpdateOrdersParams,
  addPendingOrder,
  cancelOrdersBatch,
  clearOrdersStorage,
  expireOrdersBatch,
  fulfillOrdersBatch,
  FulfillOrdersBatchParams,
  Order,
  OrderStatus,
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
import { flatOrdersStateNetwork } from './flatOrdersStateNetwork'
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
import { isOrderExpired, partialOrderUpdate } from './utils'

import { AppDispatch, AppState } from '../index'
import { serializeToken } from '../user/hooks'
import { SerializedToken } from '../user/types'

type OrderID = string

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
  chainId: SupportedChainId
}
type GetOrdersByIdParams = {
  ids: OrderID[]
  chainId?: SupportedChainId
}

type GetOrdersParams = Partial<Pick<GetRemoveOrderParams, 'chainId'>>
type CancelOrderParams = GetRemoveOrderParams
type SetOrderCancellationHashParams = CancelOrderParams & { hash: string }

interface UpdateOrdersBatchParams {
  ids: OrderID[]
  chainId: SupportedChainId
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

function deserializeToken(serializedToken: SerializedToken): TokenWithLogo {
  return TokenWithLogo.fromToken(serializedToken, serializedToken.logoURI)
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
      orders?.scheduled[id] ||
      orders?.failed[id]

    return _deserializeOrder(serialisedOrder)
  })
}

function useOrdersStateNetwork(chainId: SupportedChainId | undefined): OrdersStateNetwork | undefined {
  const ordersState = useSelector<AppState, OrdersState[SupportedChainId] | undefined>((state) => {
    if (!chainId) {
      return undefined
    }
    return state.orders?.[chainId]
  })

  // Additional memoization to avoid excessive re-renders
  // ordersState is a plain object that contains serialized data, so we can stringify it safely
  return useMemo(() => {
    if (!chainId) return undefined
    return { ...getDefaultNetworkState(chainId), ...(ordersState || {}) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(ordersState), chainId])
}

export const useOrders = (
  chainId: SupportedChainId,
  account: string | undefined,
  uiOrderType: UiOrderType
): Order[] => {
  const state = useOrdersStateNetwork(chainId)
  const accountLowerCase = account?.toLowerCase()

  return useMemo(() => {
    if (!state) return []

    return _concatOrdersState(state, ORDER_LIST_KEYS).reduce<Order[]>((acc, order) => {
      if (!order) return acc

      const doesBelongToAccount = order.order.owner.toLowerCase() === accountLowerCase
      const orderType = getUiOrderType(order.order)
      const doesMatchClass = orderType === uiOrderType

      if (doesBelongToAccount && doesMatchClass) {
        const mappedOrder = _deserializeOrder(order)

        if (mappedOrder && !mappedOrder.isHidden) {
          acc.push(mappedOrder)
        }
      }

      return acc
    }, [])
  }, [state, accountLowerCase, uiOrderType])
}

const useAllOrdersMap = ({ chainId }: GetOrdersParams): PartialOrdersMap => {
  const state = useOrdersStateNetwork(chainId)

  return useMemo(() => {
    if (!state) return {}

    return flatOrdersStateNetwork(state)
  }, [state])
}

export type OrdersMap = {
  [id: string]: Order
}

export const useOrdersById = ({ chainId, ids }: GetOrdersByIdParams): OrdersMap | null => {
  const allOrders = useAllOrdersMap({ chainId })

  return useMemo(() => {
    if (!allOrders || !ids) {
      return null
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

export const useCombinedPendingOrders = ({
  chainId,
  account,
}: {
  chainId: SupportedChainId
  account: string | undefined
}): Order[] => {
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
    if (!state || !account) return []

    const { pending, presignaturePending, creating } = state
    const allPending = Object.values(pending).concat(Object.values(presignaturePending)).concat(Object.values(creating))

    return allPending.map(_deserializeOrder).filter((order) => {
      return order?.owner.toLowerCase() === account.toLowerCase()
    }) as Order[]
  }, [state, account])
}

/**
 * Use ONLY OrderStatus.PENDING orders
 *
 * Similar to usePendingOrders
 *
 * The difference is that this hook returns only orders that have the status PENDING
 * while usePendingOrders aggregates all pending states
 */
export const useOnlyPendingOrders = (chainId: SupportedChainId, uiOrderType: UiOrderType): Order[] => {
  const state = useSelector<AppState, PartialOrdersMap | undefined>(
    (state) => chainId && state.orders?.[chainId]?.pending
  )

  return useMemo(() => {
    if (!state) return []

    return Object.values(state)
      .filter((order) => order && getUiOrderType(order.order) === uiOrderType)
      .map(_deserializeOrder)
      .filter(isTruthy)
  }, [state, uiOrderType])
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

export type UpdateOrderParams = {
  chainId: SupportedChainId
  order: Partial<Omit<Order, 'id'>> & Pick<Order, 'id'>
}

export type UpdateOrderCallback = (params: UpdateOrderParams) => void

export const usePartialUpdateOrder = (): UpdateOrderCallback => {
  const dispatch = useDispatch<AppDispatch>()
  return useCallback((params: UpdateOrderParams) => partialOrderUpdate(params, dispatch), [dispatch])
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

/**
 * Hook that "cleans" orders local storage
 * Related issue https://github.com/cowprotocol/cowswap/issues/2690
 *
 */
export const useClearOrdersStorage = () => {
  const dispatch = useDispatch<AppDispatch>()
  return useCallback(() => dispatch(clearOrdersStorage()), [dispatch])
}
