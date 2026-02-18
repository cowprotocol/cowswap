import { useAtomValue } from 'jotai'
import { useMemo } from 'react'

import { TokensByAddress } from '@cowprotocol/tokens'

import { useAsyncMemo } from 'use-async-memo'
import { atom } from 'jotai'
import { useTokensForOrdersList, getTokensListFromOrders } from 'modules/orders'

import { twapOrdersListAtom } from '../index'
import { loadable } from 'jotai/utils'

export const twapOrdersTokensAsyncAtom = atom<Promise<TokensByAddress | undefined>>(async (get) => {
  const allTwapOrders = get(twapOrdersListAtom)
  const tokensToFetch = getTokensListFromOrders(allTwapOrders)

  return getTokensForOrdersList(tokensToFetch)
})

export const twapOrdersTokensLoadableAtom = loadable(twapOrdersTokensAsyncAtom)

export function useTwapOrdersTokens(): TokensByAddress | undefined {
  const allTwapOrders = useAtomValue(twapOrdersListAtom)

  const getTokensForOrdersList = useTokensForOrdersList()

  const tokensToFetch = useMemo(() => {
    return getTokensListFromOrders(allTwapOrders)
  }, [allTwapOrders])

  return useAsyncMemo(() => getTokensForOrdersList(tokensToFetch), [getTokensForOrdersList, tokensToFetch])
}

// TODO: Review this
