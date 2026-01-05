import { createContext, ReactNode, useContext } from 'react'

import { TokenWithLogo } from '@cowprotocol/common-const'
import { ChainInfo } from '@cowprotocol/cow-sdk'
import { ListState } from '@cowprotocol/tokens'

import { TokenSelectionHandler } from '../../../types'

export interface WidgetCallbacks {
  // Header
  onDismiss: () => void
  onOpenManageWidget: () => void

  // Search
  onInputPressEnter?: () => void

  // Chain
  onSelectChain: (chain: ChainInfo) => void

  // Token
  onSelectToken: TokenSelectionHandler
  openPoolPage: (poolAddress: string) => void

  // Import flows
  onBackFromImport: () => void
  onImportTokens: (tokens: TokenWithLogo[]) => void
  onImportList: (list: ListState) => void

  // Manage widget
  onCloseManageWidget: () => void
  onClosePoolPage: () => void
}

const WidgetCallbacksContext = createContext<WidgetCallbacks | null>(null)

export function useWidgetCallbacks(): WidgetCallbacks {
  const ctx = useContext(WidgetCallbacksContext)
  if (!ctx) {
    throw new Error('useWidgetCallbacks must be used within WidgetCallbacksProvider')
  }
  return ctx
}

interface ProviderProps {
  children: ReactNode
  value: WidgetCallbacks
}

export function WidgetCallbacksProvider({ children, value }: ProviderProps): ReactNode {
  return <WidgetCallbacksContext.Provider value={value}>{children}</WidgetCallbacksContext.Provider>
}
