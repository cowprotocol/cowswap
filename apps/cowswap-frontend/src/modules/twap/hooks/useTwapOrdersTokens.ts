import { useAtomValue } from 'jotai'
import { useMemo } from 'react'

import { TokensByAddress } from '@cowprotocol/tokens'

import { useAsyncMemo } from 'use-async-memo'

import { useTokensForOrdersList, getTokensListFromOrders } from 'modules/orders'

import { useTwapPartOrdersList } from './useTwapPartOrdersList'

import { twapOrdersListAtom } from '../state/twapOrdersListAtom'

export function useTwapOrdersTokens(): TokensByAddress | undefined {
  const allTwapOrders = useAtomValue(twapOrdersListAtom)
  const twapPartOrders = useTwapPartOrdersList()

  const getTokensForOrdersList = useTokensForOrdersList()

  const tokensToFetch = useMemo(() => {
    return getTokensListFromOrders([...allTwapOrders, ...twapPartOrders])
  }, [allTwapOrders, twapPartOrders])

  return useAsyncMemo(() => getTokensForOrdersList(tokensToFetch), [getTokensForOrdersList, tokensToFetch])
}
