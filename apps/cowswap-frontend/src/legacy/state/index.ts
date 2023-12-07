import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { configureStore, StateFromReducersMapObject } from '@reduxjs/toolkit'
import { load, save } from 'redux-localstorage-simple'

import application from './application/reducer'
import claim from './claim/reducer'
import connection from './connection/reducer'
import { cowTokenMiddleware } from './cowToken/middleware'
import cowToken from './cowToken/reducer'
import enhancedTransactions from './enhancedTransactions/reducer'
import gas from './gas/reducer'
import { updateVersion } from './global/actions'
import logs from './logs/slice'
import { appziMiddleware, popupMiddleware, soundMiddleware } from './orders/middleware'
import orders from './orders/reducer'
import { priceMiddleware } from './price/middleware'
import price from './price/reducer'
import profile from './profile/reducer'
import swap from './swap/reducer'
import user from './user/reducer'

const reducers = {
  application,
  user,
  connection,
  swap,
  logs,
  transactions: enhancedTransactions, // replace transactions state by "enhancedTransactions"
  orders,
  price,
  gas,
  profile,
  claim,
  cowToken,
}

const PERSISTED_KEYS: string[] = ['user', 'transactions', 'orders', 'gas', 'affiliate', 'profile', 'swap']

export const cowSwapStore = configureStore({
  reducer: reducers,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ thunk: true, serializableCheck: false })
      .concat(save({ states: PERSISTED_KEYS, debounce: 1000 }))
      .concat(popupMiddleware)
      // TODO: fix it
      // .concat(composableOrdersPopupMiddleware)
      .concat(cowTokenMiddleware)
      .concat(soundMiddleware)
      .concat(appziMiddleware)
      .concat(priceMiddleware),
  preloadedState: load({ states: PERSISTED_KEYS, disableWarnings: process.env.NODE_ENV === 'test' }),
})

// this instantiates the app / reducers in several places using the default chainId
cowSwapStore.dispatch(updateVersion({ chainId: SupportedChainId.MAINNET }))

// TODO: this is new, should we enable it?
// setupListeners(store.dispatch)

export type AppState = StateFromReducersMapObject<typeof reducers>
export type AppDispatch = typeof cowSwapStore.dispatch
