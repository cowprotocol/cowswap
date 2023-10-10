import { useAtomValue } from 'jotai'
import { activeTokenListsMapAtom } from '../state/tokenLists/tokenListsStateAtom'

export function useActiveTokenListsIds() {
  return useAtomValue(activeTokenListsMapAtom)
}
