/**
 * SelectTokenWidget V2 - Store
 *
 * Minimal store for the token selector.
 * - UI state (search, category) is managed here
 * - Callbacks and config come from parent via props
 * - Slots read from this store, no prop drilling
 */
import { createContext, useContext } from 'react'

import { TokenWithLogo } from '@cowprotocol/common-const'
import { ChainInfo } from '@cowprotocol/cow-sdk'

import { ChainsToSelectState } from '../../../types'

export interface TokenSelectorStore {
  // ─── UI State (mutable) ───────────────────────────────────────────────────
  searchQuery: string
  setSearchQuery: (query: string) => void

  // ─── Core Callbacks (from parent) ─────────────────────────────────────────
  onSelect: (token: TokenWithLogo) => void
  onDismiss: () => void

  // ─── Optional Features (from parent) ──────────────────────────────────────
  // Chain selection
  chains?: ChainsToSelectState
  onSelectChain?: (chain: ChainInfo) => void

  // Import flow
  onImportToken?: (token: TokenWithLogo) => void
}

const TokenSelectorContext = createContext<TokenSelectorStore | null>(null)

export const TokenSelectorProvider = TokenSelectorContext.Provider

export function useTokenSelectorStore(): TokenSelectorStore {
  const ctx = useContext(TokenSelectorContext)
  if (!ctx) {
    throw new Error('useTokenSelectorStore must be used within SelectTokenWidget')
  }
  return ctx
}

// Granular hooks for specific needs (prevents unnecessary re-renders)
export function useSearch(): [string, (query: string) => void] {
  const { searchQuery, setSearchQuery } = useTokenSelectorStore()
  return [searchQuery, setSearchQuery]
}

export function useOnSelect(): (token: TokenWithLogo) => void {
  return useTokenSelectorStore().onSelect
}

export function useOnDismiss(): () => void {
  return useTokenSelectorStore().onDismiss
}

export function useChains(): ChainsToSelectState | undefined {
  return useTokenSelectorStore().chains
}

export function useOnSelectChain(): ((chain: ChainInfo) => void) | undefined {
  return useTokenSelectorStore().onSelectChain
}
