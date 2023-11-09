import { useSetAtom } from 'jotai'
import { toggleListAtom } from '../../state/tokenLists/tokenListsActionsAtom'
import { toggleListAnalytics } from '@cowprotocol/analytics'
import { ListState } from '../../types'

export function useToggleList() {
  const toggleList = useSetAtom(toggleListAtom)

  return (list: ListState, enabled: boolean) => {
    toggleList(list.source)
    toggleListAnalytics(enabled, list.source)
  }
}
