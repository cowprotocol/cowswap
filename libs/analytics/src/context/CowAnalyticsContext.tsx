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
}: PropsWithChildren<AnalyticsContextType>) => {
  return (
    <CowAnalyticsContext.Provider value={{ cowAnalytics: analyticsInstance }}>{children}</CowAnalyticsContext.Provider>
  )
}

export const useCowAnalytics = () => {
  const context = useContext(CowAnalyticsContext)
  if (!context) {
    throw new Error('required CowAnalyticsProvider')
  }
  return context.cowAnalytics
}
