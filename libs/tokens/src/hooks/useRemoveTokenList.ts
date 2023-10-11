import { useSetAtom } from 'jotai'
import { removeListAtom } from '../state/tokenLists/tokenListsActionsAtom'

export function useRemoveTokenList() {
  return useSetAtom(removeListAtom)
}
