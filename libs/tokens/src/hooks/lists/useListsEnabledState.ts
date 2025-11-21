import { useAtomValue } from 'jotai'
import { loadable } from 'jotai/utils'
import { useEffect, useState } from 'react'

import { listsEnabledStateAtom } from '../../state/tokenLists/tokenListsStateAtom'
import { ListsEnabledState } from '../../types'

const loadableListsEnabledStateAtom = loadable(listsEnabledStateAtom)

export function useListsEnabledState(): ListsEnabledState {
  const result = useAtomValue(loadableListsEnabledStateAtom)
  const [enabledState, setEnabledState] = useState<ListsEnabledState | null>(null)

  useEffect(() => {
    if (result.state === 'hasData') {
      setEnabledState(result.data)
    }
  }, [result])

  // While loading or reloading, keep the last known enabled map.
  // If we've never resolved yet, fall back to an empty object – but in that
  // initial phase the lists array is also empty (see useAllListsList), so
  // ManageLists won't render interactive toggles with incorrect state.
  if (enabledState) {
    return enabledState
  }

  if (result.state === 'hasData') {
    return result.data
  }

  return {}
}
