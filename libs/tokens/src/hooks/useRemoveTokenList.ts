import { useSetAtom } from 'jotai'
import { removeTokenListAtom } from '../state/tokenLists/tokenListsActionsAtom'

export function useRemoveTokenList() {
  return useSetAtom(removeTokenListAtom)
}
