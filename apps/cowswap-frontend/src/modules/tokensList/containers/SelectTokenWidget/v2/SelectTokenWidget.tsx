/**
 * SelectTokenWidget V2 - Root Component
 *
 * Composition-based token selector.
 * Usage:
 *
 * <SelectTokenWidget onSelect={handleSelect} onDismiss={close}>
 *   <SelectTokenWidget.Header />
 *   <SelectTokenWidget.Search />
 *   <SelectTokenWidget.TokenList tokens={tokens} />
 * </SelectTokenWidget>
 */
import { ReactNode, useState, useMemo } from 'react'

import { TokenWithLogo } from '@cowprotocol/common-const'
import { ChainInfo } from '@cowprotocol/cow-sdk'

// Import slots
import { Header } from './slots/Header'
import { NetworkPanel } from './slots/NetworkPanel'
import { Search } from './slots/Search'
import { TokenList } from './slots/TokenList'
import { TokenSelectorProvider, TokenSelectorStore } from './store'

import { ChainsToSelectState } from '../../../types'

export interface SelectTokenWidgetProps {
  children: ReactNode

  // Core callbacks (required)
  onSelect: (token: TokenWithLogo) => void
  onDismiss: () => void

  // Optional: Chain selection
  chains?: ChainsToSelectState
  onSelectChain?: (chain: ChainInfo) => void

  // Optional: Import flow
  onImportToken?: (token: TokenWithLogo) => void
}

export function SelectTokenWidget({
  children,
  onSelect,
  onDismiss,
  chains,
  onSelectChain,
  onImportToken,
}: SelectTokenWidgetProps): ReactNode {
  // UI state lives here
  const [searchQuery, setSearchQuery] = useState('')

  // Build store
  const store = useMemo<TokenSelectorStore>(
    () => ({
      searchQuery,
      setSearchQuery,
      onSelect,
      onDismiss,
      chains,
      onSelectChain,
      onImportToken,
    }),
    [searchQuery, onSelect, onDismiss, chains, onSelectChain, onImportToken],
  )

  return <TokenSelectorProvider value={store}>{children}</TokenSelectorProvider>
}

SelectTokenWidget.Header = Header
SelectTokenWidget.Search = Search
SelectTokenWidget.TokenList = TokenList
SelectTokenWidget.NetworkPanel = NetworkPanel
