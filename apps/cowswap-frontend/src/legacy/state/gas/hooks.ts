import { SupportedChainId as ChainId } from '@cowprotocol/cow-sdk'

import { useSelector } from 'react-redux'

import { GasState } from './reducer'

import { AppState } from '../index'

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function useGasPrices(chainId?: ChainId) {
  return useSelector<AppState, GasState[ChainId] | null>((state) => {
    return chainId ? state.gas[chainId] : null
  })
}
