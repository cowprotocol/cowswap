import { useAtomValue } from 'jotai'
import { loadable } from 'jotai/utils'
import { useEffect, useState } from 'react'

import { useVirtualLists } from './useVirtualLists'

import { listsStatesListAtom } from '../../state/tokenLists/tokenListsStateAtom'
import { ListState } from '../../types'

const loadableListsStatesListAtom = loadable(listsStatesListAtom)

export function useAllListsList(): ListState[] {
  const virtualLists = useVirtualLists()
  const result = useAtomValue(loadableListsStatesListAtom)

  const [allLists, setAllLists] = useState<ListState[] | null>(null)

  useEffect(() => {
    if (result.state === 'hasData') {
      setAllLists(result.data)
    }
  }, [result])

  const lists = allLists ?? (result.state === 'hasData' ? result.data : [])

  return lists.filter((list) => !virtualLists[list.source])
}
