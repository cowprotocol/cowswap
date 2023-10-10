import { useAtomValue } from 'jotai'
import { activeTokenListsMapAtom } from '../state/tokenLists/tokenListsStateAtom'
import { ActiveTokensListsMap } from '../types'

export function useActiveTokenListsIds(): ActiveTokensListsMap {
  return useAtomValue(activeTokenListsMapAtom)
}
