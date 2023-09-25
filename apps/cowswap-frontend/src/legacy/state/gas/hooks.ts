import { SupportedChainId as ChainId } from '@cowprotocol/cow-sdk'

import { useSelector } from 'react-redux'

import { GasState } from './reducer'

import { AppState } from '../index'

export function useGasPrices(chainId?: ChainId) {
  return useSelector<AppState, GasState[ChainId] | null>((state) => {
    return chainId ? state.gas[chainId] : null
  })
}
