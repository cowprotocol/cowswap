/**
 * tokenListViewAtom - Minimal UI state for the token list
 *
 * Only holds local UI state (searchInput). Token data is fetched
 * directly by components via useTokenListData hook.
 */
import { atom } from 'jotai'

import { atomWithPartialUpdate } from '@cowprotocol/common-utils'

export interface TokenListViewState {
  searchInput: string
}

export const DEFAULT_TOKEN_LIST_VIEW_STATE: TokenListViewState = {
  searchInput: '',
}

export const { atom: tokenListViewAtom, updateAtom: updateTokenListViewAtom } = atomWithPartialUpdate(
  atom<TokenListViewState>(DEFAULT_TOKEN_LIST_VIEW_STATE),
)
