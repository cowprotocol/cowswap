import { createContext, ReactNode, useContext, useMemo } from 'react'

import { TokenWithLogo } from '@cowprotocol/common-const'
import { ChainInfo } from '@cowprotocol/cow-sdk'
import { ListState, TokenListCategory } from '@cowprotocol/tokens'

import { ChainsToSelectState, TokenSelectionHandler } from '../../types'

// ============================================================================
// Context Types - Each sub-component reads only what it needs
// ============================================================================

/**
 * Header-related state and callbacks
 */
export interface HeaderContext {
  title: string
  showManageButton: boolean
  onDismiss: () => void
  onOpenManageWidget: () => void
}

/**
 * Search-related state and callbacks
 */
export interface SearchContext {
  value: string
  onChange: (value: string) => void
  onPressEnter?: () => void
}

/**
 * Chain selection state and callbacks
 */
export interface ChainContext {
  isEnabled: boolean
  title: string
  chainsToSelect: ChainsToSelectState | undefined
  mobileChainsState: ChainsToSelectState | undefined
  isMobileChainPanelOpen: boolean
  isChainPanelVisible: boolean
  onSelectChain: (chain: ChainInfo) => void
  onOpenMobileChainPanel: () => void
  onCloseMobileChainPanel: () => void
}

/**
 * Token list display configuration
 */
export interface TokenListContext {
  displayLpTokenLists: boolean
  tokenListCategoryState: [TokenListCategory[] | null, (category: TokenListCategory[] | null) => void]
  disableErc20: boolean
  isRouteAvailable: boolean | undefined
  account: string | undefined
  onSelectToken: TokenSelectionHandler
  openPoolPage: (poolAddress: string) => void
}

/**
 * Blocking views state (import modals, manage lists, etc.)
 */
export interface BlockingViewContext {
  standalone: boolean
  tokenToImport: TokenWithLogo | undefined
  listToImport: ListState | undefined
  isManageWidgetOpen: boolean
  selectedPoolAddress: string | undefined
  allTokenLists: ListState[]
  userAddedTokens: TokenWithLogo[]
  onBackFromImport: () => void
  onImportTokens: (tokens: TokenWithLogo[]) => void
  onImportList: (list: ListState) => void
  onCloseManageWidget: () => void
  onClosePoolPage: () => void
}

/**
 * Layout state
 */
export interface LayoutContext {
  isCompactLayout: boolean
  hasChainPanel: boolean
}

/**
 * Complete context value - organized by concern
 */
export interface SelectTokenWidgetContextValue {
  header: HeaderContext
  search: SearchContext
  chain: ChainContext
  tokenList: TokenListContext
  blockingView: BlockingViewContext
  layout: LayoutContext
}

// ============================================================================
// Context Definition
// ============================================================================

const SelectTokenWidgetContext = createContext<SelectTokenWidgetContextValue | null>(null)

// ============================================================================
// Hooks - Each component uses the hook for its concern
// ============================================================================

function useSelectTokenWidgetContext(): SelectTokenWidgetContextValue {
  const context = useContext(SelectTokenWidgetContext)
  if (!context) {
    throw new Error('SelectTokenWidget compound components must be used within SelectTokenWidget.Root')
  }
  return context
}

export function useHeaderContext(): HeaderContext {
  return useSelectTokenWidgetContext().header
}

export function useSearchContext(): SearchContext {
  return useSelectTokenWidgetContext().search
}

export function useChainContext(): ChainContext {
  return useSelectTokenWidgetContext().chain
}

export function useTokenListContext(): TokenListContext {
  return useSelectTokenWidgetContext().tokenList
}

export function useBlockingViewContext(): BlockingViewContext {
  return useSelectTokenWidgetContext().blockingView
}

export function useLayoutContext(): LayoutContext {
  return useSelectTokenWidgetContext().layout
}

// ============================================================================
// Provider
// ============================================================================

interface SelectTokenWidgetProviderProps {
  children: ReactNode
  value: SelectTokenWidgetContextValue
}

export function SelectTokenWidgetProvider({ children, value }: SelectTokenWidgetProviderProps): ReactNode {
  const memoizedValue = useMemo(() => value, [value])
  return <SelectTokenWidgetContext.Provider value={memoizedValue}>{children}</SelectTokenWidgetContext.Provider>
}
