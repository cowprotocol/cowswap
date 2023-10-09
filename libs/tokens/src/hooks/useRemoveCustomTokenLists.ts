import { useSetAtom } from 'jotai'
import { removeTokenListAtom } from '../state/tokenLists/tokenListsActionsAtom'

export function useRemoveCustomTokenLists() {
  return useSetAtom(removeTokenListAtom)
}
