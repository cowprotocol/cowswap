import { useSetAtom } from 'jotai'
import { useCallback } from 'react'

import { tokenListViewAtom, DEFAULT_TOKEN_LIST_VIEW_STATE } from '../state/tokenListViewAtom'

type ResetTokenListViewState = () => void

export function useResetTokenListViewState(): ResetTokenListViewState {
  const setTokenListView = useSetAtom(tokenListViewAtom)

  return useCallback((): void => {
    setTokenListView(DEFAULT_TOKEN_LIST_VIEW_STATE) // Full replacement, not partial merge
  }, [setTokenListView])
}
