import { configureStore, StateFromReducersMapObject } from '@reduxjs/toolkit'
import multicall from 'lib/state/multicall'
import { load, save } from 'redux-localstorage-simple'

import application from 'state/application/reducer'
import connection from 'state/connection/reducer'
import { updateVersion } from 'state/global/actions'
import lists from 'state/lists/reducer'
import logs from 'state/logs/slice'
import swap from 'state/swap/reducer'
import user from 'state/user/reducer'

// MOD imports
import orders from 'state/orders/reducer'
import price from 'state/price/reducer'
import gas from 'state/gas/reducer'
import profile from 'state/profile/reducer'
import enhancedTransactions from 'state/enhancedTransactions/reducer'
import claim from 'state/claim/reducer'
import cowToken from 'state/cowToken/reducer'

import { appziMiddleware, popupMiddleware, soundMiddleware } from './orders/middleware'
import { cowTokenMiddleware } from 'state/cowToken/middleware'
import { DEFAULT_NETWORK_FOR_LISTS } from 'constants/lists'
import { priceMiddleware } from 'state/price/middleware'

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
