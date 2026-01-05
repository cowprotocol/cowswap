import { ReactNode } from 'react'

import { SearchInput as SearchInputUI } from '@cowprotocol/ui'

import { t } from '@lingui/core/macro'

import * as styledEl from '../../../pure/SelectTokenModal/styled'
import { useSearchContext } from '../SelectTokenWidgetContext'

/**
 * SelectTokenWidget.SearchInput - Token search input.
 * Reads its data from SearchContext.
 */
export function SearchInput(): ReactNode {
  const { value, onChange, onPressEnter } = useSearchContext()

  return (
    <styledEl.SearchRow>
      <styledEl.SearchInputWrapper>
        <SearchInputUI
          id="token-search-input"
          value={value}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              onPressEnter?.()
            }
          }}
          onChange={(event) => onChange(event.target.value)}
          placeholder={t`Search name or paste address...`}
        />
      </styledEl.SearchInputWrapper>
    </styledEl.SearchRow>
  )
}
