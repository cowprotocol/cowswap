import { useAtomValue } from 'jotai'
import { activeTokensListsAtom } from '../state/tokensListsStateAtom'
import { TokenList } from '../types'

export function useActiveTokenLists(): TokenList[] {
  return useAtomValue(activeTokensListsAtom)
}
