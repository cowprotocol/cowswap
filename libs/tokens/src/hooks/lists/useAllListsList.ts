import { useAtomValue } from 'jotai'
import { listsStatesListAtom } from '../../state/tokenLists/tokenListsStateAtom'
import { ListState } from '../../types'
import { useVirtualLists } from './useVirtualLists'

export function useAllListsList(): ListState[] {
  const virtualLists = useVirtualLists()
  const allLists = useAtomValue(listsStatesListAtom)

  return allLists.filter((list) => !virtualLists[list.source])
}
