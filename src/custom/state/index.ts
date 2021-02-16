import { configureStore, StateFromReducersMapObject } from '@reduxjs/toolkit'
import { save, load } from 'redux-localstorage-simple'

// UNI REDUCERS
import application from '@src/state/application/reducer'
import { updateVersion } from '@src/state/global/actions'
import user from '@src/state/user/reducer'
import transactions from '@src/state/transactions/reducer'
import swap from '@src/state/swap/reducer'
import mint from '@src/state/mint/reducer'
import lists from '@src/state/lists/reducer'
import burn from '@src/state/burn/reducer'
import multicall from '@src/state/multicall/reducer'
// CUSTOM REDUCERS
import operator from './operator/reducer'
import orders from './orders/reducer'
import fee from './fee/reducer'
import { popupMiddleware } from './orders/middleware'

const UNISWAP_REDUCERS = {
  application,
  user,
  transactions,
  swap,
  mint,
  burn,
  multicall,
  lists
}

const reducers = {
  ...UNISWAP_REDUCERS,
  operator,
  orders,
  fee
}

const PERSISTED_KEYS: string[] = ['user', 'transactions', 'lists', 'orders', 'fee']

const store = configureStore({
  reducer: reducers,
  middleware: [save({ states: PERSISTED_KEYS }), popupMiddleware],
  preloadedState: load({ states: PERSISTED_KEYS })
})

store.dispatch(updateVersion())

export default store

// need to AppState derive from something other than store
// otherwise get circular reference
// if we want to use AppState in Middleware<, AppState>
export type AppState = StateFromReducersMapObject<typeof reducers>
export type AppDispatch = typeof store.dispatch
