import { useAtomValue } from 'jotai'
import { useMemo } from 'react'

import { areAddressesEqual, Nullish } from '@cowprotocol/cow-sdk'

import { XSTOCKS_LIST_URL } from '../../const/tokensLists'
import { listsStatesMapAtom } from '../../state/tokenLists/tokenListsStateAtom'

export function useIsXstockToken(token: Nullish<{ address: string }>): boolean {
  const listStatesMapAtom = useAtomValue(listsStatesMapAtom)
  const listState = listStatesMapAtom[XSTOCKS_LIST_URL]

  return useMemo(() => {
    if (!listState || !token) return false

    for (const item of listState.list.tokens) {
      if (areAddressesEqual(item.address, token.address)) return true
    }

    return false
  }, [listState, token])
}
