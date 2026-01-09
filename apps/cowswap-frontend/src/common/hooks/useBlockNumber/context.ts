import { createContext } from 'react'

export const MISSING_PROVIDER = Symbol('MISSING_PROVIDER')

export const BlockNumberContext = createContext<
  | {
      value?: number
    }
  | typeof MISSING_PROVIDER
>(MISSING_PROVIDER)
