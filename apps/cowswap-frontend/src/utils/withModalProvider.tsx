import { PropsWithChildren, ReactNode } from 'react'

import { CowAnalyticsProvider, initGtm } from '@cowprotocol/analytics'

import { combineReducers, configureStore } from '@reduxjs/toolkit'
import { Provider } from 'react-redux'

import applicationReducer from 'legacy/state/application/reducer'

import { LinguiWrapper } from '../../LinguiJestProvider'

const cowAnalytics = initGtm()

const combinedReducers = combineReducers({
  application: applicationReducer,
})
const modalStore = configureStore({
  reducer: combinedReducers,
})

export const WithModalProvider = ({ children }: PropsWithChildren): ReactNode => {
  return (
    <Provider store={modalStore}>
      <LinguiWrapper>
        <CowAnalyticsProvider cowAnalytics={cowAnalytics}>{children}</CowAnalyticsProvider>
      </LinguiWrapper>
    </Provider>
  )
}
