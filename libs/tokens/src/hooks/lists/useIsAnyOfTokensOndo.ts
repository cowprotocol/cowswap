import { useAtomValue } from 'jotai'

import { areAddressesEqual } from '@cowprotocol/cow-sdk'
import { Token } from '@uniswap/sdk-core'

import { ONDO_TOKENS_LIST_SOURCE } from '../../const/tokensLists'
import { listsStatesMapAtom } from '../../state/tokenLists/tokenListsStateAtom'

export function useIsAnyOfTokensOndo(firstToken: Token | undefined, secondToken: Token | undefined): Token | undefined {
  const listStatesMapAtom = useAtomValue(listsStatesMapAtom)
  if (!firstToken && !secondToken) return undefined

  const ondoList = listStatesMapAtom[ONDO_TOKENS_LIST_SOURCE]
  if (!ondoList) return undefined

  for (const token of ondoList.list.tokens) {
    if (areAddressesEqual(token.address, firstToken?.address)) return firstToken
    if (areAddressesEqual(token.address, secondToken?.address)) return secondToken
  }

  return undefined
}
