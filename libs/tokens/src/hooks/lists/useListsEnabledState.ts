import { useAtomValue } from 'jotai'

import { listsEnabledStateAtom } from '../../state/tokenLists/tokenListsStateAtom'
import { ListsEnabledState } from '../../types'

export function useListsEnabledState(): ListsEnabledState {
  return useAtomValue(listsEnabledStateAtom)
}
