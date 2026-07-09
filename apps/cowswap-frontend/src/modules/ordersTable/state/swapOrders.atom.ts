import { atom } from 'jotai'

import { UiOrderType } from '@cowprotocol/types'
import { walletInfoAtom } from '@cowprotocol/wallet'

import { reduxOrdersStateAtom } from './redux/reduxOrders.atom'
import { getReduxOrdersByOrderTypeFromNetworkState, getReduxOrdersStateByChain } from './redux/reduxOrders.utils'

export const swapOrdersAtom = atom((get) => {
  const { chainId, account } = get(walletInfoAtom)

  if (!chainId || !account) {
    return {
      reduxOrdersStateInCurrentChain: null,
      reduxOrders: null,
      ordersTokensSet: null,
    }
  }

  const reduxOrdersStateInCurrentChain = getReduxOrdersStateByChain(get(reduxOrdersStateAtom), chainId)

  return getReduxOrdersByOrderTypeFromNetworkState({
    account,
    reduxOrdersStateInCurrentChain,
    uiOrderType: UiOrderType.SWAP,
  })
})
