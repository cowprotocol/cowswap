import { useAtomValue } from 'jotai/index'
import { activeTokensListsMapAtom } from '../state/tokensListsStateAtom'

export function useActiveTokenListsIds() {
  return useAtomValue(activeTokensListsMapAtom)
}
