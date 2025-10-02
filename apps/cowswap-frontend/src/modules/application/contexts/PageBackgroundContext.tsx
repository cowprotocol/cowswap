import { createContext, ReactNode, useContext, Dispatch, SetStateAction } from 'react'

export type PageBackgroundVariant = 'default' | 'nocows'

export interface PageBackgroundContextValue {
  variant: PageBackgroundVariant
  setVariant: Dispatch<SetStateAction<PageBackgroundVariant>>
  scene: ReactNode | null
  setScene: Dispatch<SetStateAction<ReactNode | null>>
}

export const PageBackgroundContext = createContext<PageBackgroundContextValue | undefined>(undefined)
PageBackgroundContext.displayName = 'PageBackgroundContext'

export function usePageBackground(): PageBackgroundContextValue {
  const context = useContext(PageBackgroundContext)

  if (!context) {
    throw new Error('usePageBackground must be used within a PageBackgroundContext provider')
  }

  return context
}
