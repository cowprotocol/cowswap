import { useAtomValue } from 'jotai'
import { useMemo } from 'react'

import { TokensByAddress } from '@cowprotocol/tokens'

import { useAsyncMemo } from 'use-async-memo'

import { useTokensForOrdersList, getTokensListFromOrders } from 'modules/orders'

import { twapOrdersListAtom } from '../index'

export function useTwapOrdersTokens(): TokensByAddress | undefined {
  const allTwapOrders = useAtomValue(twapOrdersListAtom)

  const getTokensForOrdersList = useTokensForOrdersList()

  const tokensToFetch = useMemo(() => {
    return getTokensListFromOrders(allTwapOrders)
  }, [allTwapOrders])

  return useAsyncMemo(() => getTokensForOrdersList(tokensToFetch), [getTokensForOrdersList, tokensToFetch])
}

// TODO: Review this
