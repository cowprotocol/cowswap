import { useSetAtom } from 'jotai'

import { removeListAnalytics } from '@cowprotocol/analytics'

import { removeListAtom } from '../../state/tokenLists/tokenListsActionsAtom'

export function useRemoveList() {
  const removeList = useSetAtom(removeListAtom)

  return (list: { source: string }) => {
    removeList(list.source)
    removeListAnalytics('Confirm', list.source)
  }
}
