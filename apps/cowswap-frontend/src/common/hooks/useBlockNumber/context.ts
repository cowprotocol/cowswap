import { createContext, Context } from 'react'

export const MISSING_PROVIDER = Symbol('MISSING_PROVIDER')

export type BlockNumberContextType =
  | {
      value?: number
    }
  | typeof MISSING_PROVIDER

export const BlockNumberContext: Context<BlockNumberContextType> =
  createContext<BlockNumberContextType>(MISSING_PROVIDER)
