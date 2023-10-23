import { useSetAtom } from 'jotai'
import { removeListAnalytics } from '@cowprotocol/analytics'

import { removeListAtom } from '../../state/tokenLists/tokenListsActionsAtom'
import { ListState } from '../../types'

export function useRemoveList() {
  const removeList = useSetAtom(removeListAtom)

  return (list: ListState) => {
    removeList(list.source)
    removeListAnalytics('Confirm', list.source)
  }
}
