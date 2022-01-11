import { configureStore, StateFromReducersMapObject } from '@reduxjs/toolkit'
import { save, load } from 'redux-localstorage-simple'

import application from '@src/state/application/reducer'
// import { updateVersion } from '@src/state/global/actions'
import user from '@src/state/user/reducer'
import swap from '@src/state/swap/reducer'
import mint from '@src/state/mint/reducer'
import mintV3 from '@src/state/mint/v3/reducer'
// import lists from '@src/state/lists/reducer'
import burn from '@src/state/burn/reducer'
import burnV3 from '@src/state/burn/v3/reducer'
import logs from '@src/state/logs/slice'
import multicall from '@src/state/multicall/reducer'
import { api as dataApi } from '@src/state/data/slice'
import { routingApi } from '@src/state/routing/slice'
// CUSTOM REDUCERS
import lists from 'state/lists/reducer'
import orders from 'state/orders/reducer'
import price from 'state/price/reducer'
import gas from 'state/gas/reducer'
import profile from 'state/profile/reducer'
import { updateVersion } from 'state/global/actions'
import affiliate from 'state/affiliate/reducer'
import enhancedTransactions from 'state/enhancedTransactions/reducer'
import claim from 'state/claim/reducer'

import { popupMiddleware, soundMiddleware } from './orders/middleware'
import { DEFAULT_NETWORK_FOR_LISTS } from 'constants/lists'

const UNISWAP_REDUCERS = {
  application,
  user,
  swap,
  mint,
  mintV3,
  burn,
  burnV3,
  multicall,
  // lists,
  logs,
  [dataApi.reducerPath]: dataApi.reducer,
  [routingApi.reducerPath]: routingApi.reducer,
}

const reducers = {
  ...UNISWAP_REDUCERS,
  transactions: enhancedTransactions, // replace transactions state by "enhancedTransactions"
  lists,
  orders,
  price,
  gas,
  affiliate,
  profile,
  claim,
}

const PERSISTED_KEYS: string[] = ['user', 'transactions', 'orders', 'lists', 'gas', 'affiliate', 'profile']

const store = configureStore({
  reducer: reducers,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ thunk: true, serializableCheck: false })
      .concat(dataApi.middleware)
      .concat(routingApi.middleware)
      .concat(save({ states: PERSISTED_KEYS, debounce: 1000 }))
      .concat(popupMiddleware)
      .concat(soundMiddleware),
  preloadedState: load({ states: PERSISTED_KEYS, disableWarnings: process.env.NODE_ENV === 'test' }),
})

// this instantiate the app / reducers in several places using the default chainId
store.dispatch(updateVersion({ chainId: DEFAULT_NETWORK_FOR_LISTS }))

export default store

// need to AppState derive from something other than store
// otherwise get circular reference
// if we want to use AppState in Middleware<, AppState>
export type AppState = StateFromReducersMapObject<typeof reducers>
export type AppDispatch = typeof store.dispatch
