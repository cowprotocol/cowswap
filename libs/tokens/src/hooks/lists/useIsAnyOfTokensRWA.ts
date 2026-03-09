import { useAtomValue } from 'jotai'

import { areAddressesEqual } from '@cowprotocol/cow-sdk'
import { Token } from '@uniswap/sdk-core'

import { RWA_TOKENS_LIST_SOURCES } from '../../const/tokensLists'
import { listsStatesMapAtom } from '../../state/tokenLists/tokenListsStateAtom'

export function useIsAnyOfTokensRWA(firstToken: Token | undefined, secondToken: Token | undefined): Token | undefined {
  const listStatesMapAtom = useAtomValue(listsStatesMapAtom)
  if (!firstToken && !secondToken) return undefined

  for (const source of RWA_TOKENS_LIST_SOURCES) {
    const rwaTokens = listStatesMapAtom[source]
    if (!rwaTokens) continue

    for (const token of rwaTokens.list.tokens) {
      if (areAddressesEqual(token.address, firstToken?.address)) return firstToken
      if (areAddressesEqual(token.address, secondToken?.address)) return secondToken
    }
  }

  return undefined
}
