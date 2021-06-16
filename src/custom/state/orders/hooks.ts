import { ChainId } from '@uniswap/sdk'
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
  updateLastCheckedBlock,
  Order,
  fulfillOrdersBatch,
  FulfillOrdersBatchParams,
  expireOrdersBatch
} from './actions'
import { OrdersState, PartialOrdersMap } from './reducer'
import { isTruthy } from 'utils/misc'
import { OrderID } from 'utils/operator'
import { ContractDeploymentBlocks } from './consts'

interface AddPendingOrderParams extends GetRemoveOrderParams {
  order: Order
}

interface FulfillOrderParams extends GetRemoveOrderParams {
  fulfillmentTime: string
  transactionHash: string
}
interface GetRemoveOrderParams {
  id: OrderID
  chainId: ChainId
}

type GetOrdersParams = Partial<Pick<GetRemoveOrderParams, 'chainId'>>
type ClearOrdersParams = Pick<GetRemoveOrderParams, 'chainId'>
type GetLastCheckedBlockParams = GetOrdersParams
type ExpireOrderParams = GetRemoveOrderParams
type CancelOrderParams = GetRemoveOrderParams
interface ExpireOrdersBatchParams {
  ids: OrderID[]
  chainId: ChainId
}

interface UpdateLastCheckedBlockParams extends ClearOrdersParams {
  lastCheckedBlock: number
}

type AddOrderCallback = (addOrderParams: AddPendingOrderParams) => void
type RemoveOrderCallback = (removeOrderParams: GetRemoveOrderParams) => void
type FulfillOrderCallback = (fulfillOrderParams: FulfillOrderParams) => void
type FulfillOrdersBatchCallback = (fulfillOrdersBatchParams: FulfillOrdersBatchParams) => void
type ExpireOrderCallback = (fulfillOrderParams: ExpireOrderParams) => void
type ExpireOrdersBatchCallback = (expireOrdersBatchParams: ExpireOrdersBatchParams) => void
type CancelOrderCallback = (cancelOrderParams: CancelOrderParams) => void
type ClearOrdersCallback = (clearOrdersParams: ClearOrdersParams) => void
type UpdateLastCheckedBlockCallback = (updateLastCheckedBlockParams: UpdateLastCheckedBlockParams) => void

type GetOrderByIdCallback = (id: OrderID) => Order | undefined

export const useOrder = ({ id, chainId }: GetRemoveOrderParams): Order | undefined => {
  return useSelector<AppState, Order | undefined>(state => {
    const orders = state.orders[chainId]

    if (!orders) return undefined
    return (
      orders?.fulfilled[id]?.order ||
      orders?.pending[id]?.order ||
      orders?.expired[id]?.order ||
      orders?.cancelled[id]?.order
    )
  })
}

// used to extract Order.summary before showing popup
// TODO: put the whole logic inside Popup middleware
export const useFindOrderById = ({ chainId }: GetOrdersParams): GetOrderByIdCallback => {
  const state = useSelector<AppState, OrdersState[ChainId] | undefined>(state => chainId && state.orders?.[chainId])

  // stable ref, so we don't recreate the function
  const stateRef = useRef(state)
  stateRef.current = state

  // stable ref so that we don't refresh useEffect too much
  // as we need to get an order lazily before creating a popup only
  return useCallback(
    (id: OrderID) => {
      if (!chainId || !stateRef.current) return

      return (
        stateRef.current.fulfilled[id]?.order ||
        stateRef.current.pending[id]?.order ||
        stateRef.current.expired[id]?.order ||
        stateRef.current.cancelled[id]?.order
      )
    },
    [chainId]
  )
}

export const useOrders = ({ chainId }: GetOrdersParams): Order[] => {
  const state = useSelector<AppState, OrdersState[ChainId]>(state => chainId && state.orders?.[chainId])

  return useMemo(() => {
    if (!state) return []

    const allOrders = Object.values(state.fulfilled)
      .concat(Object.values(state.pending))
      .concat(Object.values(state.expired))
      .concat(Object.values(state.cancelled || {}))
      .map(orderObject => orderObject?.order)
      .filter(isTruthy)
    return allOrders
  }, [state])
}

export const useAllOrders = ({ chainId }: GetOrdersParams): PartialOrdersMap => {
  const state = useSelector<AppState, OrdersState[ChainId] | undefined>(state => chainId && state.orders?.[chainId])

  return useMemo(() => {
    if (!state) return {}

    return {
      ...state.pending,
      ...state.fulfilled,
      ...state.expired,
      ...state.cancelled
    }
  }, [state])
}

export const usePendingOrders = ({ chainId }: GetOrdersParams): Order[] => {
  const state = useSelector<AppState, PartialOrdersMap | undefined>(
    state => chainId && state.orders?.[chainId]?.pending
  )

  return useMemo(() => {
    if (!state) return []

    const allOrders = Object.values(state)
      .map(orderObject => orderObject?.order)
      .filter(isTruthy)
    return allOrders
  }, [state])
}

export const useFulfilledOrders = ({ chainId }: GetOrdersParams): Order[] => {
  const state = useSelector<AppState, PartialOrdersMap | undefined>(
    state => chainId && state.orders?.[chainId]?.fulfilled
  )

  return useMemo(() => {
    if (!state) return []

    const allOrders = Object.values(state)
      .map(orderObject => orderObject?.order)
      .filter(isTruthy)
    return allOrders
  }, [state])
}

export const useExpiredOrders = ({ chainId }: GetOrdersParams): Order[] => {
  const state = useSelector<AppState, PartialOrdersMap | undefined>(
    state => chainId && state.orders?.[chainId]?.expired
  )

  return useMemo(() => {
    if (!state) return []

    const allOrders = Object.values(state)
      .map(orderObject => orderObject?.order)
      .filter(isTruthy)
    return allOrders
  }, [state])
}

export const useAddPendingOrder = (): AddOrderCallback => {
  const dispatch = useDispatch<AppDispatch>()
  return useCallback((addOrderParams: AddPendingOrderParams) => dispatch(addPendingOrder(addOrderParams)), [dispatch])
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

export const useRemoveOrder = (): RemoveOrderCallback => {
  const dispatch = useDispatch<AppDispatch>()
  return useCallback((removeOrderParams: GetRemoveOrderParams) => dispatch(removeOrder(removeOrderParams)), [dispatch])
}

export const useClearOrders = (): ClearOrdersCallback => {
  const dispatch = useDispatch<AppDispatch>()
  return useCallback((clearOrdersParams: ClearOrdersParams) => dispatch(clearOrders(clearOrdersParams)), [dispatch])
}

export const useLastCheckedBlock = ({ chainId }: GetLastCheckedBlockParams): number => {
  return useSelector<AppState, number>(state => {
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
