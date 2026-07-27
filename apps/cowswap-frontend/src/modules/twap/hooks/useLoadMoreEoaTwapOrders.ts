import { useAtom } from 'jotai'
import { useCallback, useMemo } from 'react'

import { AMOUNT_OF_ORDERS_TO_FETCH } from '@cowprotocol/common-const'
import { getAddressKey } from '@cowprotocol/cow-sdk'
import { useWalletInfo } from '@cowprotocol/wallet'

import {
  eoaTwapOrdersRequestAtom,
  MAX_EOA_TWAP_ORDERS_LIMIT,
  selectEoaTwapOrdersRequestState,
} from '../state/eoaTwapOrdersRequestAtom'

interface UseLoadMoreEoaTwapOrdersReturn {
  limit: number
  isLoading: boolean
  hasMoreOrders: boolean
  loadMore: () => void
}

export function useLoadMoreEoaTwapOrders(enabled = true): UseLoadMoreEoaTwapOrdersReturn {
  const { account, chainId } = useWalletInfo()
  const requestKey = account && chainId ? `${chainId}:${getAddressKey(account)}` : ''
  const [storedState, setRequestState] = useAtom(eoaTwapOrdersRequestAtom)
  const state = selectEoaTwapOrdersRequestState(storedState, requestKey)

  const loadMore = useCallback((): void => {
    if (!enabled || !requestKey) return

    setRequestState((currentState) => {
      const current = selectEoaTwapOrdersRequestState(currentState, requestKey)
      return {
        ...current,
        limit: Math.min(current.limit + AMOUNT_OF_ORDERS_TO_FETCH, MAX_EOA_TWAP_ORDERS_LIMIT),
        isLoading: true,
      }
    })
  }, [enabled, requestKey, setRequestState])

  const hasMoreOrders =
    state.isLoading ||
    (state.totalCount !== null && state.limit < Math.min(state.totalCount, MAX_EOA_TWAP_ORDERS_LIMIT))

  return useMemo(
    () => ({
      limit: state.limit,
      isLoading: state.isLoading,
      hasMoreOrders,
      loadMore,
    }),
    [hasMoreOrders, loadMore, state.isLoading, state.limit],
  )
}
