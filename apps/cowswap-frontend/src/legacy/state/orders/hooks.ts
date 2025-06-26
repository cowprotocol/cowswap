import { useCallback, useMemo } from 'react'

import { SWR_NO_REFRESH_OPTIONS } from '@cowprotocol/common-const'
import { isTruthy } from '@cowprotocol/common-utils'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { UiOrderType } from '@cowprotocol/types'

import { useDispatch, useSelector } from 'react-redux'
import useSWR from 'swr'

import { addPendingOrderStep } from 'modules/trade/utils/addPendingOrderStep'

import { getUiOrderType } from 'utils/orderUtils/getUiOrderType'

import {
  addOrUpdateOrders,
  AddOrUpdateOrdersParams,
  cancelOrdersBatch,
  clearOrdersStorage,
  expireOrdersBatch,
  fulfillOrdersBatch,
  FulfillOrdersBatchParams,
  invalidateOrdersBatch,
  InvalidateOrdersBatchParams,
  Order,
  preSignOrders,
  requestOrderCancellation,
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
  ORDERS_LIST,
  OrdersState,
  OrdersStateNetwork,
  OrderTypeKeys,
  PartialOrdersMap,
} from './reducer'
import { deserializeOrder } from './utils/deserializeOrder'

import { AppDispatch, AppState } from '../index'
import { serializeToken } from '../user/hooks'

type OrderID = string

const EMPTY_ORDERS_ARRAY = [] as Order[]
const EMPTY_ORDERS_MAP = {} as PartialOrdersMap

export interface AddOrUpdateUnserialisedOrdersParams extends Omit<AddOrUpdateOrdersParams, 'orders'> {
  orders: Order[]
}

export interface AddUnserialisedPendingOrderParams extends GetRemoveOrderParams {
  order: Order
  isSafeWallet: boolean
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
  isSafeWallet: boolean
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
export type InvalidateOrdersBatchCallback = (params: InvalidateOrdersBatchParams) => void
export type PresignOrdersCallback = (fulfillOrderParams: PresignOrdersParams) => void
export type UpdatePresignGnosisSafeTxCallback = (
  updatePresignGnosisSafeTxParams: UpdatePresignGnosisSafeTxParams,
) => void
export type SetIsOrderUnfillable = (params: SetIsOrderUnfillableParams) => void
export type SetIsOrderRefundedBatchCallback = (params: SetIsOrderRefundedBatch) => void

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function _concatOrdersState(state: OrdersStateNetwork, keys: OrderTypeKeys[]) {
  if (!state) return []

  const firstState = state[keys[0]] || {}
  const restKeys = keys.slice(1)

  return restKeys.reduce((acc, nextKey) => {
    const nextState = Object.values(state[nextKey] || {})
    return acc.concat(nextState)
  }, Object.values(firstState))
}

export const useOrder = ({ id, chainId }: Partial<GetRemoveOrderParams>): Order | undefined => {
  // TODO: Reduce function complexity by extracting logic
  // eslint-disable-next-line complexity
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

    return deserializeOrder(serialisedOrder)
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
  uiOrderType: UiOrderType,
): Order[] => {
  const state = useOrdersStateNetwork(chainId)
  const accountLowerCase = account?.toLowerCase()

  return useMemo(() => {
    if (!state) return EMPTY_ORDERS_ARRAY

    return _concatOrdersState(state, ORDER_LIST_KEYS).reduce<Order[]>((acc, order) => {
      if (!order) return acc

      const doesBelongToAccount = order.order.owner.toLowerCase() === accountLowerCase
      const orderType = getUiOrderType(order.order)
      const doesMatchClass = orderType === uiOrderType

      if (doesBelongToAccount && doesMatchClass) {
        const mappedOrder = deserializeOrder(order)

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
    if (!state) return EMPTY_ORDERS_MAP

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
      const order = deserializeOrder(allOrders[id])
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
  >((state) => state.orders?.[chainId])

  return useSWR(
    [state, account],
    ([state, account]) => {
      if (!state || !account) return EMPTY_ORDERS_ARRAY

      const { pending, presignaturePending, creating } = state

      const allPending = Object.values({ ...pending, ...presignaturePending, ...creating })

      return allPending.map(deserializeOrder).filter((order) => {
        return order?.owner.toLowerCase() === account.toLowerCase()
      }) as Order[]
    },
    { ...SWR_NO_REFRESH_OPTIONS, fallbackData: EMPTY_ORDERS_ARRAY },
  ).data
}

/**
 * Use ONLY OrderStatus.PENDING orders
 *
 * Similar to usePendingOrders
 *
 * The difference is that this hook returns only orders that have the status PENDING
 * while usePendingOrders aggregates all pending states
 */
export const useOnlyPendingOrders = (chainId: SupportedChainId): Order[] => {
  const state = useSelector<AppState, PartialOrdersMap | undefined>(
    (state) => chainId && state.orders?.[chainId]?.pending,
  )

  return useMemo(() => {
    if (!state) return EMPTY_ORDERS_ARRAY

    return Object.values(state).map(deserializeOrder).filter(isTruthy)
  }, [state])
}

export const useCancelledOrders = ({ chainId }: GetOrdersParams): Order[] => {
  const state = useSelector<AppState, PartialOrdersMap | undefined>(
    (state) => chainId && state.orders?.[chainId]?.cancelled,
  )

  return useMemo(() => {
    if (!state) return EMPTY_ORDERS_ARRAY

    return Object.values(state).map(deserializeOrder).filter(isTruthy)
  }, [state])
}

export const useExpiredOrders = ({ chainId }: GetOrdersParams): Order[] => {
  const state = useSelector<AppState, PartialOrdersMap | undefined>(
    (state) => chainId && state.orders?.[chainId]?.expired,
  )

  return useMemo(() => {
    if (!state) return EMPTY_ORDERS_ARRAY

    return Object.values(state).map(deserializeOrder).filter(isTruthy)
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
    [dispatch],
  )
}

export const useAddPendingOrder = (): AddOrderCallback => {
  const dispatch = useDispatch<AppDispatch>()
  return useCallback(
    (addOrderParams: AddUnserialisedPendingOrderParams) => {
      addPendingOrderStep(addOrderParams, dispatch)
    },
    [dispatch],
  )
}

export type UpdateOrderParams = {
  chainId: SupportedChainId
  order: Partial<Omit<Order, 'id'>> & Pick<Order, 'id'>
  isSafeWallet: boolean
}

export const useFulfillOrdersBatch = (): FulfillOrdersBatchCallback => {
  const dispatch = useDispatch<AppDispatch>()
  return useCallback(
    (fulfillOrdersBatchParams: FulfillOrdersBatchParams) => dispatch(fulfillOrdersBatch(fulfillOrdersBatchParams)),
    [dispatch],
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
    [dispatch],
  )
}

export const useExpireOrdersBatch = (): ExpireOrdersBatchCallback => {
  const dispatch = useDispatch<AppDispatch>()
  return useCallback(
    (expireOrdersBatchParams: ExpireOrdersBatchParams) => dispatch(expireOrdersBatch(expireOrdersBatchParams)),
    [dispatch],
  )
}

export const useCancelOrdersBatch = (): CancelOrdersBatchCallback => {
  const dispatch = useDispatch<AppDispatch>()
  return useCallback(
    (cancelOrdersBatchParams: CancelOrdersBatchParams) => dispatch(cancelOrdersBatch(cancelOrdersBatchParams)),
    [dispatch],
  )
}

export const useInvalidateOrdersBatch = (): InvalidateOrdersBatchCallback => {
  const dispatch = useDispatch<AppDispatch>()

  return useCallback((params: InvalidateOrdersBatchParams) => dispatch(invalidateOrdersBatch(params)), [dispatch])
}

export const useSetOrderCancellationHash = (): SetOrderCancellationHashCallback => {
  const dispatch = useDispatch<AppDispatch>()
  return useCallback((params: SetOrderCancellationHashParams) => dispatch(setOrderCancellationHash(params)), [dispatch])
}

export const useRequestOrderCancellation = (): CancelOrderCallback => {
  const dispatch = useDispatch<AppDispatch>()
  return useCallback(
    (cancelOrderParams: CancelOrderParams) => dispatch(requestOrderCancellation(cancelOrderParams)),
    [dispatch],
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
// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const useClearOrdersStorage = () => {
  const dispatch = useDispatch<AppDispatch>()
  return useCallback(() => dispatch(clearOrdersStorage()), [dispatch])
}
