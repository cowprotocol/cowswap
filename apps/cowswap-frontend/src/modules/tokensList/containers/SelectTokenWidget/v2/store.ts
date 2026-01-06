/**
 * SelectTokenWidget V2 - Store
 *
 * Single source of truth for the token selector.
 * Combines what was previously split across:
 * - WidgetConfig (static data)
 * - WidgetCallbacks (event handlers)
 * - Jotai atoms (UI state)
 */
import { createContext, useContext } from 'react'

import { TokenWithLogo } from '@cowprotocol/common-const'
import { ChainInfo } from '@cowprotocol/cow-sdk'
import { ListState, TokenListCategory } from '@cowprotocol/tokens'

import { ChainsToSelectState, TokenSelectionHandler } from '../../../types'

export interface TokenSelectorStore {
  // ─── Config (static for this render) ────────────────────────────────────────
  title: string
  showManageButton: boolean
  chainsPanelTitle: string
  chainsToSelect: ChainsToSelectState | undefined
  displayLpTokenLists: boolean
  tokenListCategoryState: [TokenListCategory[] | null, (category: TokenListCategory[] | null) => void]
  disableErc20: boolean
  isRouteAvailable: boolean | undefined
  account: string | undefined
  standalone: boolean

  // Blocking views data
  tokenToImport: TokenWithLogo | undefined
  listToImport: ListState | undefined
  selectedPoolAddress: string | undefined
  allTokenLists: ListState[]
  userAddedTokens: TokenWithLogo[]

  // Layout state
  isCompactLayout: boolean
  isChainPanelVisible: boolean
  isChainPanelEnabled: boolean
  isMobileChainPanelOpen: boolean
  isManageWidgetOpen: boolean

  // ─── Callbacks ──────────────────────────────────────────────────────────────
  onDismiss: () => void
  onOpenManageWidget: () => void
  onInputPressEnter?: () => void
  onSelectChain: (chain: ChainInfo) => void
  onSelectToken: TokenSelectionHandler
  openPoolPage: (poolAddress: string) => void
  onBackFromImport: () => void
  onImportTokens: (tokens: TokenWithLogo[]) => void
  onImportList: (list: ListState) => void
  onCloseManageWidget: () => void
  onClosePoolPage: () => void

  // Mobile chain panel
  onOpenMobileChainPanel: () => void
  onCloseMobileChainPanel: () => void
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

// ─── Granular Hooks (for components that only need specific data) ─────────────

export function useHeaderState(): {
  title: string
  showManageButton: boolean
  onDismiss: () => void
  onOpenManageWidget: () => void
} {
  const store = useTokenSelectorStore()
  return {
    title: store.title,
    showManageButton: store.showManageButton,
    onDismiss: store.onDismiss,
    onOpenManageWidget: store.onOpenManageWidget,
  }
}

export function useSearchState(): {
  onPressEnter: (() => void) | undefined
} {
  const store = useTokenSelectorStore()
  return { onPressEnter: store.onInputPressEnter }
}

export function useChainState(): {
  isEnabled: boolean
  isVisible: boolean
  title: string
  chainsToSelect: ChainsToSelectState | undefined
  mobileChainsState: ChainsToSelectState | undefined
  isMobileChainPanelOpen: boolean
  isCompactLayout: boolean
  onSelectChain: (chain: ChainInfo) => void
  onOpenMobileChainPanel: () => void
  onCloseMobileChainPanel: () => void
} {
  const store = useTokenSelectorStore()
  const mobileChainsState = store.isChainPanelEnabled && !store.isChainPanelVisible ? store.chainsToSelect : undefined

  return {
    isEnabled: store.isChainPanelEnabled,
    isVisible: store.isChainPanelVisible,
    title: store.chainsPanelTitle,
    chainsToSelect: store.chainsToSelect,
    mobileChainsState,
    isMobileChainPanelOpen: store.isMobileChainPanelOpen,
    isCompactLayout: store.isCompactLayout,
    onSelectChain: store.onSelectChain,
    onOpenMobileChainPanel: store.onOpenMobileChainPanel,
    onCloseMobileChainPanel: store.onCloseMobileChainPanel,
  }
}

export function useTokenListState(): {
  displayLpTokenLists: boolean
  tokenListCategoryState: [TokenListCategory[] | null, (category: TokenListCategory[] | null) => void]
  disableErc20: boolean
  isRouteAvailable: boolean | undefined
  account: string | undefined
  onSelectToken: TokenSelectionHandler
  openPoolPage: (poolAddress: string) => void
} {
  const store = useTokenSelectorStore()
  return {
    displayLpTokenLists: store.displayLpTokenLists,
    tokenListCategoryState: store.tokenListCategoryState,
    disableErc20: store.disableErc20,
    isRouteAvailable: store.isRouteAvailable,
    account: store.account,
    onSelectToken: store.onSelectToken,
    openPoolPage: store.openPoolPage,
  }
}

export function useBlockingViewState(): {
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
} {
  const store = useTokenSelectorStore()
  return {
    standalone: store.standalone,
    tokenToImport: store.tokenToImport,
    listToImport: store.listToImport,
    isManageWidgetOpen: store.isManageWidgetOpen,
    selectedPoolAddress: store.selectedPoolAddress,
    allTokenLists: store.allTokenLists,
    userAddedTokens: store.userAddedTokens,
    onDismiss: store.onDismiss,
    onBackFromImport: store.onBackFromImport,
    onImportTokens: store.onImportTokens,
    onImportList: store.onImportList,
    onCloseManageWidget: store.onCloseManageWidget,
    onClosePoolPage: store.onClosePoolPage,
    onSelectToken: store.onSelectToken,
  }
}

export function useHasBlockingView(): boolean {
  const store = useTokenSelectorStore()
  return Boolean(
    (store.tokenToImport && !store.standalone) ||
      (store.listToImport && !store.standalone) ||
      (store.isManageWidgetOpen && !store.standalone) ||
      store.selectedPoolAddress,
  )
}
