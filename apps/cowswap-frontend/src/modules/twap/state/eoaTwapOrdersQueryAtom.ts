import { getAddressKey } from '@cowprotocol/cow-sdk'
import { AccountType } from '@cowprotocol/types'
import { accountTypeAtom, walletInfoAtom } from '@cowprotocol/wallet'

import { atomWithQuery, queryClientAtom } from 'jotai-tanstack-query'
import ms from 'ms.macro'

import { ordersLimitAtom } from 'modules/orders/state/ordersLimitAtom'

import { featureFlagsAtom } from 'common/state/featureFlagsState'

import { programmaticOrdersApi } from '../services/programmaticOrdersApi'

type EoaTwapOrdersQueryData = Awaited<ReturnType<typeof programmaticOrdersApi.fetchEoaTwapOrders>>
const EOA_TWAP_ORDERS_UPDATE_INTERVAL = ms`1s`

export const eoaTwapOrdersQueryAtom = atomWithQuery<EoaTwapOrdersQueryData>((get) => {
  const { account, chainId } = get(walletInfoAtom)
  const owner = account ? getAddressKey(account) : ''
  const limit = get(ordersLimitAtom)
  const accountType = get(accountTypeAtom)

  const queryClient = get(queryClientAtom)
  const queryKey = ['eoaTwapOrders', chainId, owner, limit] as const

  return {
    queryKey,
    queryFn: async () => {
      if (!chainId || !owner) return { orders: {}, totalCount: 0, updatedAtBlock: '0' }

      const previous = queryClient.getQueryData<EoaTwapOrdersQueryData>(queryKey)
      if (!previous) return programmaticOrdersApi.fetchEoaTwapOrders(owner, chainId, limit)

      const changes = await programmaticOrdersApi.fetchChangedEoaTwapOrders(
        owner,
        chainId,
        previous.updatedAtBlock,
        new Set(Object.keys(previous.orders)),
      )

      if (changes.updatedAtBlock === previous.updatedAtBlock && Object.keys(changes.orders).length === 0) {
        return previous
      }

      return { ...changes, totalCount: previous.totalCount, orders: { ...previous.orders, ...changes.orders } }
    },
    enabled:
      get(featureFlagsAtom).isTwapEoaEnabled === true &&
      (accountType === AccountType.EOA || accountType === AccountType.EIP7702EOA) &&
      !!chainId &&
      !!owner,
    placeholderData: (previousData, previousQuery) =>
      previousQuery?.queryKey[1] === chainId && previousQuery.queryKey[2] === owner ? previousData : undefined,
    refetchInterval: EOA_TWAP_ORDERS_UPDATE_INTERVAL,
    staleTime: 0,
  }
})
