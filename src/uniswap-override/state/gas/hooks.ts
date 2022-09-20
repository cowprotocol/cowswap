import { SupportedChainId as ChainId } from 'constants/chains'
import { useCallback } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { GasState } from './reducer'
import { updateGasPrices, UpdateGasPrices } from './actions'
import { AppDispatch } from 'state'
import { AppState } from '..'

export function useGasPrices(chainId?: ChainId) {
  return useSelector<AppState, GasState[ChainId] | null>((state) => {
    return chainId ? state.gas[chainId] : null
  })
}

export function useUpdateGasPrices() {
  const dispatch = useDispatch<AppDispatch>()
  return useCallback((gasParams: UpdateGasPrices) => dispatch(updateGasPrices(gasParams)), [dispatch])
}
