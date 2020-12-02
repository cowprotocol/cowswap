import { configureStore, getDefaultMiddleware } from '@reduxjs/toolkit'
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

const PERSISTED_KEYS: string[] = ['user', 'transactions', 'lists']

const store = configureStore({
  reducer: {
    ...UNISWAP_REDUCERS,
    operator
  },
  middleware: [...getDefaultMiddleware({ thunk: false }), save({ states: PERSISTED_KEYS })],
  preloadedState: load({ states: PERSISTED_KEYS })
})

store.dispatch(updateVersion())

export default store

export type AppState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
