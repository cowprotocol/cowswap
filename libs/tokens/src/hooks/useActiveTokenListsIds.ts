import { useAtomValue } from 'jotai/index'
import { activeTokenListsMapAtom } from '../state/tokenLists/tokenListsStateAtom'

export function useActiveTokenListsIds() {
  return useAtomValue(activeTokenListsMapAtom)
}
