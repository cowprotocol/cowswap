import { useSetAtom } from 'jotai'

import { removeListAtom } from '../../state/tokenLists/tokenListsActionsAtom'

export function useRemoveList(callback: (source: string) => void) {
  const removeList = useSetAtom(removeListAtom)

  return (list: { source: string }) => {
    removeList(list.source)
    callback(list.source)
  }
}
