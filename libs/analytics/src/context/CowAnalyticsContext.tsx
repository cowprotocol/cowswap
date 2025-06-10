'use client'

import { createContext, useContext, PropsWithChildren } from 'react'

import { CowAnalytics } from '../CowAnalytics'

interface AnalyticsContextType {
  cowAnalytics: CowAnalytics
}

export const CowAnalyticsContext = createContext<AnalyticsContextType | undefined>(undefined)

export const CowAnalyticsProvider = ({
  children,
  cowAnalytics: analyticsInstance,
// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
}: PropsWithChildren<AnalyticsContextType>) => {
  return (
    <CowAnalyticsContext.Provider value={{ cowAnalytics: analyticsInstance }}>{children}</CowAnalyticsContext.Provider>
  )
}

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const useCowAnalytics = () => {
  const context = useContext(CowAnalyticsContext)
  if (!context) {
    throw new Error('required CowAnalyticsProvider')
  }
  return context.cowAnalytics
}
