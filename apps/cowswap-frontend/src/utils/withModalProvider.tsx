import { PropsWithChildren } from 'react'

import { CowAnalyticsProvider, initGtm } from '@cowprotocol/analytics'

import { combineReducers, configureStore } from '@reduxjs/toolkit'
import { Provider } from 'react-redux'

import applicationReducer from 'legacy/state/application/reducer'

const cowAnalytics = initGtm()

const combinedReducers = combineReducers({
  application: applicationReducer,
})
const modalStore = configureStore({
  reducer: combinedReducers,
})
export const WithModalProvider = ({ children }: PropsWithChildren) => {
  return (
    <Provider store={modalStore}>
      <CowAnalyticsProvider cowAnalytics={cowAnalytics}>{children}</CowAnalyticsProvider>
    </Provider>
  )
}
