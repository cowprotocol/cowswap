import { ChainId } from '@uniswap/sdk'
import { useCallback, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { AppDispatch, AppState } from 'state'
import { addPendingOrder, removeOrder, clearOrders, fulfillOrder, Order, OrderID } from './actions'
import { OrdersState, PartialOrdersMap } from './reducer'
import { isTruthy } from 'utils/misc'

interface AddPendingOrderParams extends GetRemoveOrderParams {
  order: Order
}

interface FulfillOrderParams extends GetRemoveOrderParams {
  fulfillmentTime: string
}
interface GetRemoveOrderParams {
  id: OrderID
  chainId: ChainId
}

interface ClearOrdersParams {
  chainId: ChainId
}

type GetOrdersParams = Pick<GetRemoveOrderParams, 'chainId'>

type AddOrderCallback = (addOrderParams: AddPendingOrderParams) => void
type RemoveOrderCallback = (clearOrderParams: GetRemoveOrderParams) => void
type FulfillOrderCallback = (fulfillOrderParams: FulfillOrderParams) => void
type ClearOrdersCallback = (clearOrdersParams: ClearOrdersParams) => void

export const useOrder = ({ id, chainId }: GetRemoveOrderParams): Order | undefined => {
  const state = useSelector<AppState, OrdersState[ChainId]>(state => state.orders[chainId])

  return state?.fulfilled[id]?.order || state?.pending[id]?.order
}

export const useOrders = ({ chainId }: GetOrdersParams): Order[] => {
  const state = useSelector<AppState, OrdersState[ChainId]>(state => state.orders?.[chainId])

  return useMemo(() => {
    if (!state) return []

    const allOrders = Object.values(state.fulfilled)
      .concat(Object.values(state.pending))
      .map(orderObject => orderObject?.order)
      .filter(isTruthy)
    return allOrders
  }, [state])
}

export const usePendingOrders = ({ chainId }: GetOrdersParams): Order[] => {
  const state = useSelector<AppState, PartialOrdersMap | undefined>(state => state.orders?.[chainId]?.pending)

  return useMemo(() => {
    if (!state) return []

    const allOrders = Object.values(state)
      .map(orderObject => orderObject?.order)
      .filter(isTruthy)
    return allOrders
  }, [state])
}

export const useFulfilledOrders = ({ chainId }: GetOrdersParams): Order[] => {
  const state = useSelector<AppState, PartialOrdersMap | undefined>(state => state.orders?.[chainId]?.fulfilled)

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

export const useFulfillOrder = (): FulfillOrderCallback => {
  const dispatch = useDispatch<AppDispatch>()
  return useCallback((fulfillOrderParams: FulfillOrderParams) => dispatch(fulfillOrder(fulfillOrderParams)), [dispatch])
}

export const useRemoveOrder = (): RemoveOrderCallback => {
  const dispatch = useDispatch<AppDispatch>()
  return useCallback((removeOrderParams: GetRemoveOrderParams) => dispatch(removeOrder(removeOrderParams)), [dispatch])
}

export const useClearOrders = (): ClearOrdersCallback => {
  const dispatch = useDispatch<AppDispatch>()
  return useCallback((clearOrdersParams: ClearOrdersParams) => dispatch(clearOrders(clearOrdersParams)), [dispatch])
}
