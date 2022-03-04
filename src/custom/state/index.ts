import { configureStore, StateFromReducersMapObject } from '@reduxjs/toolkit'
// import { setupListeners } from '@reduxjs/toolkit/query/react'
import multicall from 'lib/state/multicall'
import { load, save } from 'redux-localstorage-simple'

import application from 'state/application/reducer'
// import burn from './burn/reducer'
// import burnV3 from './burn/v3/reducer'
// import { api as dataApi } from './data/slice'
import { updateVersion } from 'state/global/actions'
import lists from 'state/lists/reducer'
import logs from '@src/state/logs/slice'
// import mint from './mint/reducer'
// import mintV3 from './mint/v3/reducer'
// import { routingApi } from './routing/slice'
import swap from '@src/state/swap/reducer'
// import transactions from './transactions/reducer'
import user from '@src/state/user/reducer'

// MOD imports
import orders from 'state/orders/reducer'
import price from 'state/price/reducer'
import gas from 'state/gas/reducer'
import profile from 'state/profile/reducer'
import affiliate from 'state/affiliate/reducer'
import enhancedTransactions from 'state/enhancedTransactions/reducer'
import claim from 'state/claim/reducer'

import { popupMiddleware, soundMiddleware } from './orders/middleware'
import { claimMinedMiddleware } from './claim/middleware'
import { DEFAULT_NETWORK_FOR_LISTS } from 'constants/lists'

const UNISWAP_REDUCERS = {
  application,
  user,
  // transactions,
  swap,
  /* mint,
  mintV3,
  burn,
  burnV3, */
  multicall: multicall.reducer,
  // lists,
  logs,
  /* [dataApi.reducerPath]: dataApi.reducer,
  [routingApi.reducerPath]: routingApi.reducer, */
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
      // .concat(dataApi.middleware)
      // .concat(routingApi.middleware)
      .concat(save({ states: PERSISTED_KEYS, debounce: 1000 }))
      .concat(popupMiddleware)
      .concat(claimMinedMiddleware)
      .concat(soundMiddleware),
  preloadedState: load({ states: PERSISTED_KEYS, disableWarnings: process.env.NODE_ENV === 'test' }),
})

// this instantiate the app / reducers in several places using the default chainId
store.dispatch(updateVersion({ chainId: DEFAULT_NETWORK_FOR_LISTS }))

// TODO: this is new, should we enable it?
// setupListeners(store.dispatch)

export default store

// need to AppState derive from something other than store
// otherwise get circular reference
// if we want to use AppState in Middleware<, AppState>
// TODO: the original does not do that, maybe no longer needed?
// export type AppState = ReturnType<typeof store.getState>
export type AppState = StateFromReducersMapObject<typeof reducers>
export type AppDispatch = typeof store.dispatch
