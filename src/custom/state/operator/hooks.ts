import { ChainId } from '@uniswap/sdk'
import { useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { AppDispatch, AppState } from 'state'
import { updateTip, clearTip, addPendingOrder, OrderID, Order, Tip } from './actions'
import { OperatorState } from './reducer'

interface AddPendingOrderParams extends GetRemoveOrderParams {
  order: Order
}

interface GetRemoveOrderParams {
  id: OrderID
  chainId: ChainId
}

type AddOrderCallback = (addOrderParams: AddPendingOrderParams) => void

interface AddTipParams extends ClearTipParams {
  tip: Tip
}
interface ClearTipParams {
  token: string // token address
}

type AddTipCallback = (addTokenParams: AddTipParams) => void
type ClearTipCallback = (clearTokenParams: ClearTipParams) => void

export const useAddPendingOrder = (): AddOrderCallback => {
  const dispatch = useDispatch<AppDispatch>()
  return useCallback((addOrderParams: AddPendingOrderParams) => dispatch(addPendingOrder(addOrderParams)), [dispatch])
}

export const useTip = (tokenAddress: string): Tip | undefined => {
  const { tipsMap } = useSelector<AppState, OperatorState>(state => state.operator)

  return tipsMap[tokenAddress]?.tip
}

export const useAddTip = (): AddTipCallback => {
  const dispatch = useDispatch<AppDispatch>()
  return (addTokenParams: AddTipParams) => dispatch(updateTip(addTokenParams))
}

export const useClearTip = (): ClearTipCallback => {
  const dispatch = useDispatch<AppDispatch>()
  return (clearTokenParams: ClearTipParams) => dispatch(clearTip(clearTokenParams))
}
