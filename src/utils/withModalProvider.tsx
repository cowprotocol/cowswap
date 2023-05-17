import applicationReducer from 'state/application/reducer'
import { combineReducers, configureStore } from '@reduxjs/toolkit'
import { Provider } from 'react-redux'
import { ReactNode } from 'react'

const combinedReducers = combineReducers({
  application: applicationReducer,
})
const modalStore = configureStore({
  reducer: combinedReducers,
})
export const withModalProvider = ({ children }: { children?: ReactNode }) => {
  return <Provider store={modalStore}>{children}</Provider>
}
