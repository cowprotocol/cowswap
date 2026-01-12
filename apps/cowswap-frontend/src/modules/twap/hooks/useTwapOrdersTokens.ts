import { useAtomValue } from 'jotai'
import { useMemo } from 'react'

import { TokensByAddress } from '@cowprotocol/tokens'

import { twapOrdersListAtom } from 'entities/twap'
import { useAsyncMemo } from 'use-async-memo'

import { useTokensForOrdersList, getTokensListFromOrders } from 'modules/orders'

export function useTwapOrdersTokens(): TokensByAddress | undefined {
  const allTwapOrders = useAtomValue(twapOrdersListAtom)

  const getTokensForOrdersList = useTokensForOrdersList()

  const tokensToFetch = useMemo(() => {
    return getTokensListFromOrders(allTwapOrders)
  }, [allTwapOrders])

  return useAsyncMemo(() => getTokensForOrdersList(tokensToFetch), [getTokensForOrdersList, tokensToFetch])
}
