import { createContext, useContext } from 'react'

import { TokenWithLogo } from '@cowprotocol/common-const'
import { ListState } from '@cowprotocol/tokens'

import { TokenSelectionHandler } from '../../../../types'

export interface BlockingViewStore {
  standalone: boolean
  tokenToImport: TokenWithLogo | undefined
  listToImport: ListState | undefined
  isManageWidgetOpen: boolean
  selectedPoolAddress: string | undefined
  allTokenLists: ListState[]
  userAddedTokens: TokenWithLogo[]
  onDismiss: () => void
  onBackFromImport: () => void
  onImportTokens: (tokens: TokenWithLogo[]) => void
  onImportList: (list: ListState) => void
  onCloseManageWidget: () => void
  onClosePoolPage: () => void
  onSelectToken: TokenSelectionHandler
}

const BlockingViewContext = createContext<BlockingViewStore | null>(null)

export const BlockingViewProvider = BlockingViewContext.Provider

export function useBlockingViewStore(): BlockingViewStore {
  const ctx = useContext(BlockingViewContext)
  if (!ctx) throw new Error('useBlockingViewStore must be used within BlockingViewProvider')
  return ctx
}

export function useHasBlockingView(): boolean {
  const store = useBlockingViewStore()
  return Boolean(
    (store.tokenToImport && !store.standalone) ||
      (store.listToImport && !store.standalone) ||
      (store.isManageWidgetOpen && !store.standalone) ||
      store.selectedPoolAddress,
  )
}
