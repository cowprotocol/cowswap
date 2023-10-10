import { useSetAtom } from 'jotai'
import { toggleListAtom } from '../state/tokenLists/tokenListsActionsAtom'

export function useToggleListCallback() {
  return useSetAtom(toggleListAtom)
}
