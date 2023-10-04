import { useSetAtom } from 'jotai'
import { toggleListAtom } from '../state/tokensListsActionsAtom'

export function useToggleListCallback() {
  return useSetAtom(toggleListAtom)
}
