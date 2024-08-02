import React, { createContext, useContext, PropsWithChildren } from 'react'

import { CowAnalytics } from '../CowAnalytics'

interface AnalyticsContextType {
  cowAnalytics: CowAnalytics
}

const AnalyticsContext = createContext<AnalyticsContextType | undefined>(undefined)

export const CowAnalyticsProvider = ({
  children,
  cowAnalytics: analyticsInstance,
}: PropsWithChildren<AnalyticsContextType>) => {
  return <AnalyticsContext.Provider value={{ cowAnalytics: analyticsInstance }}>{children}</AnalyticsContext.Provider>
}

export const useCowAnalytics = () => {
  const context = useContext(AnalyticsContext)
  if (!context) {
    throw new Error('required CowAnalyticsProvider')
  }
  return context.cowAnalytics
}
