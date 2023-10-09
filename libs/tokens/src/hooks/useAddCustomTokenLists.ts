import { useSetAtom } from 'jotai'
import { addTokenListAtom } from '../state/tokenLists/tokenListsActionsAtom'

export function useAddCustomTokenLists() {
  return useSetAtom(addTokenListAtom)
}
