import combineReducers from 'combine-reducers'

import { GLOBAL_INITIAL_STATE, globalRootReducer, GlobalState } from '../state'
import { reducer as networkReducer } from '../state/network'
import { Network } from '../types'

export type ExplorerAppState = GlobalState & {
  networkId: Network | null
}

export const INITIAL_STATE = (): ExplorerAppState => ({
  ...GLOBAL_INITIAL_STATE(),
  networkId: null,
})

export const rootReducer = combineReducers({
  ...globalRootReducer,
  networkId: networkReducer,
})
