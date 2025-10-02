import { createContext, ReactNode, useContext } from 'react'

export type PageBackgroundVariant = 'default' | 'nocows'

export interface PageBackgroundContextValue {
  variant: PageBackgroundVariant
  setVariant: (variant: PageBackgroundVariant) => void
  scene: ReactNode | null
  setScene: (scene: ReactNode | null) => void
}

export const PageBackgroundContext = createContext<PageBackgroundContextValue | undefined>(undefined)

export function usePageBackground(): PageBackgroundContextValue {
  const context = useContext(PageBackgroundContext)

  if (!context) {
    throw new Error('usePageBackground must be used within a PageBackgroundContext provider')
  }

  return context
}
