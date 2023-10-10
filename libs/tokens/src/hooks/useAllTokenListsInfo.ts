import { useAtomValue } from 'jotai'
import { allTokenListsInfoAtom } from '../state/tokenLists/tokenListsStateAtom'
import { TokenListInfo } from '../types'

export function useAllTokenListsInfo(): TokenListInfo[] {
  return useAtomValue(allTokenListsInfoAtom)
}
