/**
 * Search Slot - Token search input
 *
 * Uses the tokenListViewAtom for search state (shared with TokensContent)
 */
import { useAtomValue } from 'jotai'
import { ReactNode, useCallback } from 'react'

import { SearchInput as SearchInputUI } from '@cowprotocol/ui'

import { t } from '@lingui/core/macro'

import { useUpdateTokenListViewState } from '../../../../hooks/useUpdateTokenListViewState'
import * as styledEl from '../../../../pure/SelectTokenModal/styled'
import { tokenListViewAtom } from '../../../../state/tokenListViewAtom'
import { useSearchState } from '../store'

export function Search(): ReactNode {
  const { searchInput } = useAtomValue(tokenListViewAtom)
  const updateTokenListView = useUpdateTokenListViewState()
  const { onPressEnter } = useSearchState()

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      updateTokenListView({ searchInput: e.target.value.trim() })
    },
    [updateTokenListView],
  )

  return (
    <styledEl.SearchRow>
      <styledEl.SearchInputWrapper>
        <SearchInputUI
          id="token-search-input"
          value={searchInput}
          onChange={handleChange}
          onKeyDown={(e) => e.key === 'Enter' && onPressEnter?.()}
          placeholder={t`Search name or paste address...`}
        />
      </styledEl.SearchInputWrapper>
    </styledEl.SearchRow>
  )
}
