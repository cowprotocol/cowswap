import { configureStore, StateFromReducersMapObject } from '@reduxjs/toolkit'
import { save, load } from 'redux-localstorage-simple'

// UNI REDUCERS
import application from '@src/state/application/reducer'
import user from '@src/state/user/reducer'
import transactions from '@src/state/transactions/reducer'
import swap from '@src/state/swap/reducer'
import mint from '@src/state/mint/reducer'
import burn from '@src/state/burn/reducer'
import multicall from '@src/state/multicall/reducer'
// CUSTOM REDUCERS
import lists from './lists/reducer'
import orders from './orders/reducer'
import price from './price/reducer'
import gas from 'state/gas/reducer'
import { updateVersion } from 'state/global/actions'

import { popupMiddleware, soundMiddleware } from './orders/middleware'
import { DEFAULT_NETWORK_FOR_LISTS } from 'constants/lists'

const UNISWAP_REDUCERS = {
  application,
  user,
  transactions,
  swap,
  mint,
  burn,
  multicall
}

const reducers = {
  ...UNISWAP_REDUCERS,
  lists,
  orders,
  price,
  gas
}

const PERSISTED_KEYS: string[] = ['user', 'transactions', 'orders', 'lists', 'gas']

const store = configureStore({
  reducer: reducers,
  middleware: [save({ states: PERSISTED_KEYS }), popupMiddleware, soundMiddleware],
  preloadedState: load({ states: PERSISTED_KEYS })
})

// this instantiate the app / reducers in several places using the default chainId
store.dispatch(updateVersion({ chainId: DEFAULT_NETWORK_FOR_LISTS }))

export default store

// need to AppState derive from something other than store
// otherwise get circular reference
// if we want to use AppState in Middleware<, AppState>
export type AppState = StateFromReducersMapObject<typeof reducers>
export type AppDispatch = typeof store.dispatch
