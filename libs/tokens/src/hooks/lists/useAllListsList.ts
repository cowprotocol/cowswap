import { useAtomValue } from 'jotai'
import { listsStatesListAtom } from '../../state/tokenLists/tokenListsStateAtom'
import { ListState } from '../../types'

export function useAllListsList(): ListState[] {
  return useAtomValue(listsStatesListAtom)
}
