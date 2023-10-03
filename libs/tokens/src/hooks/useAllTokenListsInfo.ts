import { useAtomValue } from 'jotai'
import { allTokenListsInfoAtom } from '../state/tokensListsStateAtom'
import { TokenListInfo } from '../types'

export function useAllTokenListsInfo(): TokenListInfo[] {
  return useAtomValue(allTokenListsInfoAtom)
}
