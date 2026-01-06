/**
 * CoreStore - Minimal store with only essential callbacks
 * Used by the pure SelectTokenWidget component
 */
import { createContext, useContext } from 'react'

import { TokenWithLogo } from '@cowprotocol/common-const'

export interface CoreStore {
  onSelect: (token: TokenWithLogo) => void
  onDismiss: () => void
}

const CoreContext = createContext<CoreStore | null>(null)

export const CoreProvider = CoreContext.Provider

export function useCoreStore(): CoreStore {
  const ctx = useContext(CoreContext)
  if (!ctx) throw new Error('useCoreStore must be used within SelectTokenWidget')
  return ctx
}
