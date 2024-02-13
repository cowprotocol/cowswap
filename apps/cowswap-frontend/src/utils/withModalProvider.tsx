import { PropsWithChildren } from 'react'

import { combineReducers, configureStore } from '@reduxjs/toolkit'
import { Provider } from 'react-redux'

import applicationReducer from 'legacy/state/application/reducer'

const combinedReducers = combineReducers({
  application: applicationReducer,
})
const modalStore = configureStore({
  reducer: combinedReducers,
})
export const WithModalProvider = ({ children }: PropsWithChildren) => {
  return <Provider store={modalStore}>{children}</Provider>
}
