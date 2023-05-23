import { configureStore, StateFromReducersMapObject } from '@reduxjs/toolkit'
import multicall from 'lib/state/multicall'
import { load, save } from 'redux-localstorage-simple'

import application from 'legacy/state/application/reducer'
import connection from 'legacy/state/connection/reducer'
import { updateVersion } from 'legacy/state/global/actions'
import lists from 'legacy/state/lists/reducer'
import logs from 'legacy/state/logs/slice'
import swap from 'legacy/state/swap/reducer'
import user from 'legacy/state/user/reducer'

// MOD imports
import orders from 'legacy/state/orders/reducer'
import price from 'legacy/state/price/reducer'
import gas from 'legacy/state/gas/reducer'
import profile from 'legacy/state/profile/reducer'
import enhancedTransactions from 'legacy/state/enhancedTransactions/reducer'
import claim from 'legacy/state/claim/reducer'
import cowToken from 'legacy/state/cowToken/reducer'

import { appziMiddleware, popupMiddleware, soundMiddleware } from './orders/middleware'
import { cowTokenMiddleware } from 'legacy/state/cowToken/middleware'
import { DEFAULT_NETWORK_FOR_LISTS } from 'legacy/constants/lists'
import { priceMiddleware } from 'legacy/state/price/middleware'

const UNISWAP_REDUCERS = {
  application,
  user,
  connection,
  swap,
  multicall: multicall.reducer,
  logs,
}

const reducers = {
  ...UNISWAP_REDUCERS,
  transactions: enhancedTransactions, // replace transactions state by "enhancedTransactions"
  lists,
  orders,
  price,
  gas,
  profile,
  claim,
  cowToken,
}

const PERSISTED_KEYS: string[] = ['user', 'transactions', 'orders', 'lists', 'gas', 'affiliate', 'profile', 'swap']

const store = configureStore({
  reducer: reducers,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ thunk: true, serializableCheck: false })
      .concat(save({ states: PERSISTED_KEYS, debounce: 1000 }))
      .concat(popupMiddleware)
      .concat(cowTokenMiddleware)
      .concat(soundMiddleware)
      .concat(appziMiddleware)
      .concat(priceMiddleware),
  preloadedState: load({ states: PERSISTED_KEYS, disableWarnings: process.env.NODE_ENV === 'test' }),
})

// this instantiate the app / reducers in several places using the default chainId
store.dispatch(updateVersion({ chainId: DEFAULT_NETWORK_FOR_LISTS }))

// TODO: this is new, should we enable it?
// setupListeners(store.dispatch)

export default store

export type AppState = StateFromReducersMapObject<typeof reducers>
export type AppDispatch = typeof store.dispatch
