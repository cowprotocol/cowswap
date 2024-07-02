import { useAtomValue } from 'jotai'

import { useVirtualLists } from './useVirtualLists'

import { listsStatesListAtom } from '../../state/tokenLists/tokenListsStateAtom'
import { ListState } from '../../types'

export function useAllListsList(): ListState[] {
  const virtualLists = useVirtualLists()
  const allLists = useAtomValue(listsStatesListAtom)

  return allLists.filter((list) => !virtualLists[list.source])
}
