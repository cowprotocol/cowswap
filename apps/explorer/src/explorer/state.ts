import combineReducers from 'combine-reducers'

import { reducer as networkReducer } from '../state/network'
import { Theme } from '../theme/types'
import { Network } from '../types'

export type ExplorerAppState = {
  theme: Theme
  networkId: Network | null
}

export const INITIAL_STATE = (): ExplorerAppState => ({
  theme: Theme.DARK,
  networkId: null,
})

export const rootReducer = combineReducers({
  theme: (state = Theme.DARK) => state,
  networkId: networkReducer,
})
