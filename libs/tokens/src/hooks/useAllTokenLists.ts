import { useAtomValue } from 'jotai'
import { allTokensListsAtom } from '../state/tokensListsStateAtom'
import { TokenList } from '../types'

export function useAllTokenLists(): TokenList[] {
  return useAtomValue(allTokensListsAtom)
}
