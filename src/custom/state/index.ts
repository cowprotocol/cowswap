import { configureStore, getDefaultMiddleware, StateFromReducersMapObject } from '@reduxjs/toolkit'
import { save, load } from 'redux-localstorage-simple'

// UNI REDUCERS
import application from '@src/state/application/reducer'
// import { updateVersion } from '@src/state/global/actions'
import user from '@src/state/user/reducer'
import transactions from '@src/state/transactions/reducer'
import swap from '@src/state/swap/reducer'
import mint from '@src/state/mint/reducer'
import mintV3 from '@src/state/mint/v3/reducer'
// import lists from './lists/reducer'
import burn from '@src/state/burn/reducer'
import burnV3 from '@src/state/burn/v3/reducer'
import multicall from '@src/state/multicall/reducer'
// CUSTOM REDUCERS
import lists from './lists/reducer'
import orders from './orders/reducer'
import price from './price/reducer'
import gas from 'state/gas/reducer'
import profile from 'state/profile/reducer'
import { updateVersion } from 'state/global/actions'
import affiliate from 'state/affiliate/reducer'

import { popupMiddleware, soundMiddleware } from './orders/middleware'
import { DEFAULT_NETWORK_FOR_LISTS } from 'constants/lists'

const UNISWAP_REDUCERS = {
  application,
  user,
  transactions,
  swap,
  mint,
  mintV3,
  burn,
  burnV3,
  multicall,
}

const reducers = {
  ...UNISWAP_REDUCERS,
  lists,
  orders,
  price,
  gas,
  affiliate,
  profile,
}

const PERSISTED_KEYS: string[] = ['user', 'transactions', 'orders', 'lists', 'gas', 'affiliate', 'profile']

const store = configureStore({
  reducer: reducers,
  middleware: [
    ...getDefaultMiddleware({ thunk: false }),
    save({ states: PERSISTED_KEYS, debounce: 1000 }),
    popupMiddleware,
    soundMiddleware,
  ],
  preloadedState: load({ states: PERSISTED_KEYS }),
})

// this instantiate the app / reducers in several places using the default chainId
store.dispatch(updateVersion({ chainId: DEFAULT_NETWORK_FOR_LISTS }))

export default store

// need to AppState derive from something other than store
// otherwise get circular reference
// if we want to use AppState in Middleware<, AppState>
export type AppState = StateFromReducersMapObject<typeof reducers>
export type AppDispatch = typeof store.dispatch
