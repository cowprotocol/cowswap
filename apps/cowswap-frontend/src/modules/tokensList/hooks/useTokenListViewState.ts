import { useAtomValue } from 'jotai'

import { tokenListViewAtom, TokenListViewState } from '../state/tokenListViewAtom'

export function useTokenListViewState(): TokenListViewState {
  return useAtomValue(tokenListViewAtom)
}
