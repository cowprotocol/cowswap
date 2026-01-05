/**
 * Search Slot - Token search input
 */
import { ReactNode } from 'react'

import { SearchInput as SearchInputUI } from '@cowprotocol/ui'

import { t } from '@lingui/core/macro'

import * as styledEl from '../../../../pure/SelectTokenModal/styled'
import { useSearch } from '../store'

export interface SearchProps {
  placeholder?: string
  onPressEnter?: () => void
}

export function Search({ placeholder, onPressEnter }: SearchProps): ReactNode {
  const [query, setQuery] = useSearch()

  return (
    <styledEl.SearchRow>
      <styledEl.SearchInputWrapper>
        <SearchInputUI
          id="token-search-input"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && onPressEnter?.()}
          placeholder={placeholder ?? t`Search name or paste address...`}
        />
      </styledEl.SearchInputWrapper>
    </styledEl.SearchRow>
  )
}
