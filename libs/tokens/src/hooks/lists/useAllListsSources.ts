import { useAtomValue } from 'jotai'

import { allListsSourcesAtom } from '../../state/tokenLists/tokenListsStateAtom'
import { ListSourceConfig } from '../../types'

export function useAllListsSources(): ListSourceConfig[] {
  return useAtomValue(allListsSourcesAtom)
}
