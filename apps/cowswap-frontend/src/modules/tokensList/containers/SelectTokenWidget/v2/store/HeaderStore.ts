import { createContext, useContext } from 'react'

export interface HeaderStore {
  title: string
  showManageButton: boolean
  onDismiss: () => void
  onOpenManageWidget: () => void
}

const HeaderContext = createContext<HeaderStore | null>(null)

export const HeaderProvider = HeaderContext.Provider

export function useHeaderStore(): HeaderStore {
  const ctx = useContext(HeaderContext)
  if (!ctx) throw new Error('useHeaderStore must be used within HeaderProvider')
  return ctx
}
