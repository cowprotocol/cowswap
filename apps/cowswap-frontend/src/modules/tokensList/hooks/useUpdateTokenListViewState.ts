import { useSetAtom } from 'jotai'
import { SetStateAction } from 'jotai/vanilla'

import { updateTokenListViewAtom, TokenListViewState } from '../state/tokenListViewAtom'

type UpdateTokenListViewState = (update: SetStateAction<Partial<TokenListViewState>>) => void

export function useUpdateTokenListViewState(): UpdateTokenListViewState {
  return useSetAtom(updateTokenListViewAtom)
}
