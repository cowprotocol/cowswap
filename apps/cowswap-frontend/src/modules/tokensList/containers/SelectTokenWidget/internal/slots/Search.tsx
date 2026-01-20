import { useAtomValue } from 'jotai'
import { ReactNode, useCallback } from 'react'

import { SearchInput as SearchInputUI } from '@cowprotocol/ui'

import { t } from '@lingui/core/macro'

import { useUpdateTokenListViewState } from '../../../../hooks/useUpdateTokenListViewState'
import * as styledEl from '../../../../pure/SelectTokenModal/styled'
import { tokenListViewAtom } from '../../../../state/tokenListViewAtom'

export interface SearchProps {
  onPressEnter?: () => void
  placeholder?: string
}

export function Search({ onPressEnter, placeholder }: SearchProps): ReactNode {
  const { searchInput } = useAtomValue(tokenListViewAtom)
  const updateTokenListView = useUpdateTokenListViewState()

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      updateTokenListView({ searchInput: e.target.value.trim() })
    },
    [updateTokenListView],
  )

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') onPressEnter?.()
    },
    [onPressEnter],
  )

  return (
    <styledEl.SearchRow>
      <styledEl.SearchInputWrapper>
        <SearchInputUI
          id="token-search-input"
          value={searchInput}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder ?? t`Search name or paste address...`}
        />
      </styledEl.SearchInputWrapper>
    </styledEl.SearchRow>
  )
}
