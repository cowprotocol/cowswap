import { useAtomValue } from 'jotai'
import { useCallback } from 'react'

import { useUpdateTokenListViewState } from '../../../hooks/useUpdateTokenListViewState'
import { tokenListViewAtom } from '../../../state/tokenListViewAtom'
import { useWidgetCallbacks } from '../context/WidgetCallbacksContext'

interface SearchState {
  value: string
  onChange: (value: string) => void
  onPressEnter: (() => void) | undefined
}

export function useSearchState(): SearchState {
  const { searchInput } = useAtomValue(tokenListViewAtom)
  const updateTokenListView = useUpdateTokenListViewState()
  const { onInputPressEnter } = useWidgetCallbacks()

  const setSearchValue = useCallback(
    (value: string) => {
      updateTokenListView({ searchInput: value.trim() })
    },
    [updateTokenListView],
  )

  return { value: searchInput, onChange: setSearchValue, onPressEnter: onInputPressEnter }
}
