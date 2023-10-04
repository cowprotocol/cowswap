import { useSetAtom } from 'jotai'
import { removeTokenListAtom } from '../state/tokensListsActionsAtom'

export function useRemoveCustomTokenLists() {
  return useSetAtom(removeTokenListAtom)
}
