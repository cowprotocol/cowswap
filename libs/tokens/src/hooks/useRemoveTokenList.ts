import { useSetAtom } from 'jotai'
import { removeListAnalytics } from '@cowprotocol/analytics'

import { removeListAtom } from '../state/tokenLists/tokenListsActionsAtom'
import { ListState } from '../types'
import { getTokenListSource } from '../utils/getTokenListSource'

export function useRemoveTokenList() {
  const removeList = useSetAtom(removeListAtom)

  return (list: ListState) => {
    removeList(list.id)
    removeListAnalytics('Confirm', getTokenListSource(list.source))
  }
}
