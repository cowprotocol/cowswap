import { SupportedChainId as ChainId } from 'constants/chains'
import { useCallback } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { GasState } from './reducer'
import { updateGasPrices, UpdateGasPrices } from './actions'
import { AppDispatch } from 'state'
import { AppState } from '..'
import { DEFAULT_NETWORK_FOR_LISTS } from 'constants/lists'
import { GAS_FEE_ENDPOINTS } from 'constants/index'

export interface GasFeeEndpointResponse {
  lastUpdate: string
  lowest: string
  safeLow: string
  standard: string
  fast: string
  fastest: string
}

export async function getGasPrices(chainId: ChainId = DEFAULT_NETWORK_FOR_LISTS): Promise<GasFeeEndpointResponse> {
  const response = await fetch(GAS_FEE_ENDPOINTS[chainId])
  return response.json()
}

export function useGasPrices(chainId?: ChainId) {
  return useSelector<AppState, GasState[ChainId] | null>((state) => {
    return chainId ? state.gas[chainId] : null
  })
}

export function useUpdateGasPrices() {
  const dispatch = useDispatch<AppDispatch>()
  return useCallback((gasParams: UpdateGasPrices) => dispatch(updateGasPrices(gasParams)), [dispatch])
}
