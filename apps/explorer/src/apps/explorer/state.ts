import { GlobalState, GLOBAL_INITIAL_STATE, globalRootReducer } from 'state'
import { Erc20State, INITIAL_ERC20_STATE, reducer as erc20sReducer } from 'state/erc20'
import { reducer as networkReducer } from 'state/network'

import combineReducers from 'combine-reducers'
import { Network } from 'types'

export type ExplorerAppState = GlobalState & {
  erc20s: Erc20State
  networkId: Network | null
}

export const INITIAL_STATE = (): ExplorerAppState => ({
  ...GLOBAL_INITIAL_STATE(),
  erc20s: INITIAL_ERC20_STATE,
  networkId: null,
})

export const rootReducer = combineReducers({
  ...globalRootReducer,
  erc20s: erc20sReducer,
  networkId: networkReducer,
})
