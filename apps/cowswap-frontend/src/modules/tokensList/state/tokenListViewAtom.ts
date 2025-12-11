import { atom } from 'jotai'

import { TokenWithLogo } from '@cowprotocol/common-const'
import { atomWithPartialUpdate } from '@cowprotocol/common-utils'

import { SelectTokenContext } from '../types'

export interface TokenListViewState {
  // Token data
  allTokens: TokenWithLogo[]
  favoriteTokens: TokenWithLogo[]
  recentTokens: TokenWithLogo[] | undefined

  // UI state
  searchInput: string
  areTokensLoading: boolean
  areTokensFromBridge: boolean
  hideFavoriteTokensTooltip: boolean
  displayLpTokenLists: boolean
  selectedTargetChainId: number | undefined

  // Context - never null, use safe empty defaults
  selectTokenContext: SelectTokenContext

  // Callbacks
  onClearRecentTokens: (() => void) | undefined
}

// Safe empty context that won't crash on access
// BalancesState requires: values, isLoading, chainId, fromCache
const EMPTY_SELECT_TOKEN_CONTEXT: SelectTokenContext = {
  balancesState: {
    values: {},
    isLoading: false,
    chainId: null,
    fromCache: false,
  },
  selectedToken: undefined,
  onSelectToken: () => {},
  onTokenListItemClick: undefined,
  unsupportedTokens: {},
  permitCompatibleTokens: {},
  tokenListTags: {},
  isWalletConnected: false,
}

export const DEFAULT_TOKEN_LIST_VIEW_STATE: TokenListViewState = {
  allTokens: [],
  favoriteTokens: [],
  recentTokens: undefined,
  searchInput: '',
  areTokensLoading: true, // Default to loading to avoid flash of empty state
  areTokensFromBridge: false,
  hideFavoriteTokensTooltip: false,
  displayLpTokenLists: false,
  selectedTargetChainId: undefined,
  selectTokenContext: EMPTY_SELECT_TOKEN_CONTEXT,
  onClearRecentTokens: undefined,
}

export const { atom: tokenListViewAtom, updateAtom: updateTokenListViewAtom } = atomWithPartialUpdate(
  atom<TokenListViewState>(DEFAULT_TOKEN_LIST_VIEW_STATE),
)
