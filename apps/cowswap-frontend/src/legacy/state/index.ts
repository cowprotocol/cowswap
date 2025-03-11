import { configureStore, StateFromReducersMapObject } from '@reduxjs/toolkit'
import { load, save } from 'redux-localstorage-simple'

import application from './application/reducer'
import { cowTokenMiddleware } from './cowToken/middleware'
import cowToken from './cowToken/reducer'
import enhancedTransactions from './enhancedTransactions/reducer'
import gas from './gas/reducer'
import { appziMiddleware, soundMiddleware } from './orders/middleware'
import orders from './orders/reducer'
import user from './user/reducer'

const reducers = {
  application,
  user,
  transactions: enhancedTransactions, // replace transactions state by "enhancedTransactions"
  orders,
  gas,
  cowToken,
}

const PERSISTED_KEYS: string[] = ['user', 'transactions', 'orders', 'gas', 'swap']

export const cowSwapStore = configureStore({
  reducer: reducers,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ thunk: true, serializableCheck: false })
      .concat(save({ states: PERSISTED_KEYS, debounce: 1000 }))
      .concat(cowTokenMiddleware)
      .concat(soundMiddleware)
      .concat(appziMiddleware),
  preloadedState: load({ states: PERSISTED_KEYS, disableWarnings: process.env.NODE_ENV === 'test' }),
})

export type AppState = StateFromReducersMapObject<typeof reducers>
export type AppDispatch = typeof cowSwapStore.dispatch
