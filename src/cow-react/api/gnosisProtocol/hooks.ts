import useSWR from 'swr'

import { useWeb3React } from '@web3-react/core'
import { getOrders } from '@cow/api/gnosisProtocol/api'
import { AMOUNT_OF_ORDERS_TO_FETCH } from 'constants/index'
import { supportedChainId } from 'utils/supportedChainId'
import { EnrichedOrder } from '@cowprotocol/cow-sdk'

export function useGpOrders(account?: string | null, refreshInterval?: number): EnrichedOrder[] | undefined {
  const { chainId: _chainId } = useWeb3React()
  const chainId = supportedChainId(_chainId)

  const { data } = useSWR<EnrichedOrder[]>(
    ['orders', account, chainId],
    () => (chainId && account ? getOrders(chainId, account, AMOUNT_OF_ORDERS_TO_FETCH) : []),
    { refreshInterval }
  )

  return data
}

export function useHasOrders(account?: string | null): boolean | undefined {
  const gpOrders = useGpOrders(account)

  return (gpOrders?.length || 0) > 0
}
