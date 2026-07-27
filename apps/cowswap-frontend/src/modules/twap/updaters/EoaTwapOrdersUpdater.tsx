import { useAtom, useSetAtom } from 'jotai'
import { ReactNode, useEffect } from 'react'

import { ORDER_BOOK_API_UPDATE_INTERVAL } from '@cowprotocol/common-const'
import { useFeatureFlags } from '@cowprotocol/common-hooks'
import { logTwap, normalizeError } from '@cowprotocol/common-utils'
import { getAddressKey } from '@cowprotocol/cow-sdk'
import type { SupportedChainId } from '@cowprotocol/cow-sdk'
import { AccountType } from '@cowprotocol/types'
import { useAccountType, useWalletInfo } from '@cowprotocol/wallet'

import { eoaTwapOrdersAtom } from 'entities/twap'
import useSWR from 'swr'

import { fetchEoaTwapOrders } from '../services/fetchEoaTwapOrders'
import {
  eoaTwapOrdersRequestAtom,
  getInitialEoaTwapOrdersRequestState,
  selectEoaTwapOrdersRequestState,
} from '../state/eoaTwapOrdersRequestAtom'

import type { SWRConfiguration } from 'swr'

const SWR_OPTIONS: SWRConfiguration = {
  refreshInterval: ORDER_BOOK_API_UPDATE_INTERVAL,
  refreshWhenHidden: false,
  refreshWhenOffline: false,
  revalidateOnFocus: true,
}

export function EoaTwapOrdersUpdater(): ReactNode {
  const { isTwapEoaEnabled } = useFeatureFlags()
  const { account, chainId } = useWalletInfo()
  const accountType = useAccountType()

  if (!isTwapEoaEnabled || accountType !== AccountType.EOA || !account || !chainId) return null

  return <EnabledEoaTwapOrdersUpdater account={account} chainId={chainId} />
}

function EnabledEoaTwapOrdersUpdater({ account, chainId }: { account: string; chainId: SupportedChainId }): null {
  const owner = getAddressKey(account)
  const requestKey = `${chainId}:${owner}`
  const setEoaTwapOrders = useSetAtom(eoaTwapOrdersAtom)
  const [storedRequestState, setRequestState] = useAtom(eoaTwapOrdersRequestAtom)
  const requestState = selectEoaTwapOrdersRequestState(storedRequestState, requestKey)
  const { data, error } = useSWR(
    ['EoaTwapOrdersUpdater', chainId, owner, requestState.limit] as const,
    async ([, currentChainId, currentOwner, limit]) => {
      const result = await fetchEoaTwapOrders(currentOwner, currentChainId, limit)

      return {
        requestKey: `${currentChainId}:${currentOwner}`,
        limit,
        ...result,
      }
    },
    SWR_OPTIONS,
  )

  useEffect(() => {
    setRequestState(getInitialEoaTwapOrdersRequestState(requestKey))
  }, [requestKey, setRequestState])

  useEffect(() => {
    if (!data || data.requestKey !== requestKey) return

    setEoaTwapOrders((currentOrders) => ({ ...currentOrders, ...data.orders }))
    setRequestState((currentState) => {
      if (currentState.requestKey !== requestKey || data.limit !== requestState.limit) return currentState

      return {
        ...currentState,
        isLoading: false,
        totalCount: data.totalCount,
      }
    })
  }, [data, requestKey, requestState.limit, setEoaTwapOrders, setRequestState])

  useEffect(() => {
    if (!error) return

    setRequestState((currentState) =>
      currentState.requestKey === requestKey ? { ...currentState, isLoading: false } : currentState,
    )
    logTwap.error(normalizeError(error), { chainId: String(chainId) })
  }, [chainId, error, requestKey, setRequestState])

  return null
}
