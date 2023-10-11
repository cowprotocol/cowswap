import { useSetAtom } from 'jotai'
import { toggleListAtom } from '../../state/tokenLists/tokenListsActionsAtom'
import { toggleListAnalytics } from '@cowprotocol/analytics'
import { ListState } from '../../types'
import { getTokenListSource } from '../../utils/getTokenListSource'

export function useToggleList() {
  const toggleList = useSetAtom(toggleListAtom)

  return (list: ListState, enabled: boolean) => {
    toggleList(list.id)
    toggleListAnalytics(enabled, getTokenListSource(list.source))
  }
}
