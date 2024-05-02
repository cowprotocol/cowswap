import { useAtomValue } from 'jotai'

import { virtualListsStateAtom } from '../../state/tokenLists/tokenListsStateAtom'

export function useVirtualLists() {
  return useAtomValue(virtualListsStateAtom)
}
