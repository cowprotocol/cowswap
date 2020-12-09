import { useDispatch, useSelector } from 'react-redux'

import { AppDispatch, AppState } from 'state'
import { updateTip, clearTip, Tip } from './actions'
import { OperatorState } from './reducer'

interface AddTipParams extends ClearTipParams {
  tip: Tip
}
interface ClearTipParams {
  token: string // token address
}

type AddTipCallback = (addTokenParams: AddTipParams) => void
type ClearTipCallback = (clearTokenParams: ClearTipParams) => void

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
