import { atom } from 'jotai'

import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { OrdersState, OrdersStateNetwork, getDefaultNetworkState } from 'legacy/state/orders/reducer'
import { atomFromReduxSelector } from 'legacy/utils/atomFromReduxSelector'

const reduxOrdersStateAtom = atomFromReduxSelector<OrdersState>((appState) => appState.orders)

export const reduxOrdersStateByChainAtom = atom((get) => (chainId: SupportedChainId) => {
  if (!chainId) return {} as OrdersStateNetwork

  const reduxOrdersStateByChain = get(reduxOrdersStateAtom)?.[chainId] || {}

  return { ...getDefaultNetworkState(chainId), ...reduxOrdersStateByChain }
})
