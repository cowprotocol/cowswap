import { useSetAtom } from 'jotai'
import { addTokenListAtom } from '../state/tokensListsActionsAtom'

export function useAddCustomTokenLists() {
  return useSetAtom(addTokenListAtom)
}
