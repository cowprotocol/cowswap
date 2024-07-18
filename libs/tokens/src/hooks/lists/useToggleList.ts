import { useSetAtom } from 'jotai'

import { toggleListAtom } from '../../state/tokenLists/tokenListsActionsAtom'
import { ListState } from '../../types'

export function useToggleList(callback: (enabled: boolean, source: string) => void) {
  const toggleList = useSetAtom(toggleListAtom)

  return (list: ListState, enabled: boolean) => {
    toggleList(list.source)
    callback(enabled, list.source)
  }
}
