import { useAtomValue } from 'jotai'

import { tokenListsUpdatingAtom } from '../../state/tokenLists/tokenListsStateAtom'

export function useAreTokenListsLoading(): boolean {
  return useAtomValue(tokenListsUpdatingAtom)
}
