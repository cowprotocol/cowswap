import { useSetAtom } from 'jotai'
import { addListAtom } from '../state/tokenLists/tokenListsActionsAtom'

export function useAddCustomTokenLists() {
  return useSetAtom(addListAtom)
}
