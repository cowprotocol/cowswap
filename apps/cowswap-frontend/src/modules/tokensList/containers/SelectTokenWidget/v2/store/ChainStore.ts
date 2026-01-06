import { createContext, useContext } from 'react'

import { ChainInfo } from '@cowprotocol/cow-sdk'

import { ChainsToSelectState } from '../../../../types'

export interface ChainStore {
  isEnabled: boolean
  isVisible: boolean
  title: string
  chainsToSelect: ChainsToSelectState | undefined
  isMobileChainPanelOpen: boolean
  isCompactLayout: boolean
  onSelectChain: (chain: ChainInfo) => void
  onOpenMobileChainPanel: () => void
  onCloseMobileChainPanel: () => void
}

const ChainContext = createContext<ChainStore | null>(null)

export const ChainProvider = ChainContext.Provider

export function useChainStore(): ChainStore {
  const ctx = useContext(ChainContext)
  if (!ctx) throw new Error('useChainStore must be used within ChainProvider')
  return ctx
}

export function useMobileChainsState(): ChainsToSelectState | undefined {
  const store = useChainStore()
  return store.isEnabled && !store.isVisible ? store.chainsToSelect : undefined
}
