import { ORDER_BOOK_API_UPDATE_INTERVAL } from '@cowprotocol/common-const'
import { getAddressKey } from '@cowprotocol/cow-sdk'
import { AccountType } from '@cowprotocol/types'
import { accountTypeAtom, walletInfoAtom } from '@cowprotocol/wallet'

import { atomWithQuery } from 'jotai-tanstack-query'

import { ordersLimitAtom } from 'modules/orders/state/ordersLimitAtom'

import { featureFlagsAtom } from 'common/state/featureFlagsState'

import { fetchEoaTwapOrders } from '../services/fetchEoaTwapOrders'

type EoaTwapOrdersQueryData = Awaited<ReturnType<typeof fetchEoaTwapOrders>>

export const eoaTwapOrdersQueryAtom = atomWithQuery<EoaTwapOrdersQueryData>((get) => {
  const { account, chainId } = get(walletInfoAtom)
  const owner = account ? getAddressKey(account) : ''
  const limit = get(ordersLimitAtom)

  return {
    queryKey: ['eoaTwapOrders', chainId, owner, limit] as const,
    queryFn: async () => {
      if (!chainId || !owner) return { orders: {}, totalCount: 0 }

      return fetchEoaTwapOrders(owner, chainId, limit)
    },
    enabled:
      get(featureFlagsAtom).isTwapEoaEnabled === true &&
      get(accountTypeAtom) === AccountType.EOA &&
      !!chainId &&
      !!owner,
    placeholderData: (previousData, previousQuery) =>
      previousQuery?.queryKey[1] === chainId && previousQuery.queryKey[2] === owner ? previousData : undefined,
    refetchInterval: ORDER_BOOK_API_UPDATE_INTERVAL,
    staleTime: 0,
  }
})
