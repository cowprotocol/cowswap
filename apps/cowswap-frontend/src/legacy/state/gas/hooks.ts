import { useCallback } from 'react'

import { SupportedChainId as ChainId } from '@cowprotocol/cow-sdk'

import { useSelector, useDispatch } from 'react-redux'

import { AppDispatch } from 'legacy/state'
import { AppState } from 'legacy/state'

import { updateGasPrices, UpdateGasPrices } from './actions'
import { GasState } from './reducer'

export function useGasPrices(chainId?: ChainId) {
  return useSelector<AppState, GasState[ChainId] | null>((state) => {
    return chainId ? state.gas[chainId] : null
  })
}

export function useUpdateGasPrices() {
  const dispatch = useDispatch<AppDispatch>()
  return useCallback((gasParams: UpdateGasPrices) => dispatch(updateGasPrices(gasParams)), [dispatch])
}
