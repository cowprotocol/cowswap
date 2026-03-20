import { atom } from 'jotai'

import { UiOrderType } from '@cowprotocol/types'
import { walletInfoAtom } from '@cowprotocol/wallet'

import { getReduxOrdersByOrderTypeFromNetworkState } from './redux/getReduxOrdersByOrderType'
import { reduxOrdersStateByChainAtom } from './redux/reduxOrders.atom'

export const swapOrdersAtom = atom((get) => {
  const { chainId, account } = get(walletInfoAtom)

  if (!chainId || !account) {
    return {
      reduxOrdersStateInCurrentChain: null,
      reduxOrders: null,
      ordersTokensSet: null,
    }
  }

  const reduxOrdersStateInCurrentChain = get(reduxOrdersStateByChainAtom)(chainId)

  return getReduxOrdersByOrderTypeFromNetworkState({
    account,
    reduxOrdersStateInCurrentChain,
    uiOrderType: UiOrderType.SWAP,
  })
})
