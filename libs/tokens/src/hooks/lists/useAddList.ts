import { useSetAtom } from 'jotai'
import { addListAtom } from '../../state/tokenLists/tokenListsActionsAtom'

export function useAddList() {
  return useSetAtom(addListAtom)
}
