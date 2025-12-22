import { createContext } from 'react'

const MISSING_PROVIDER = Symbol()

type BlockNumberContextType =
  | {
      value?: number
    }
  | typeof MISSING_PROVIDER

export const BlockNumberContext = createContext<BlockNumberContextType>(MISSING_PROVIDER)

// Attach the symbol to the context for external use
BlockNumberContext.MISSING_PROVIDER = MISSING_PROVIDER
