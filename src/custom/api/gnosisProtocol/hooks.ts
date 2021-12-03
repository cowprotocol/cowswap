import useSWR from 'swr'

import { useActiveWeb3React } from 'hooks/web3'
import { getOrders, OrderMetaData } from 'api/gnosisProtocol/api'
import { AMOUNT_OF_ORDERS_TO_FETCH } from 'constants/index'

export function useGpOrders(account?: string | null, refreshInterval?: number): OrderMetaData[] | undefined {
  const { chainId } = useActiveWeb3React()

  const { data } = useSWR<OrderMetaData[]>(
    ['orders', account, chainId],
    () => (chainId && account ? getOrders(chainId, account, AMOUNT_OF_ORDERS_TO_FETCH) : []),
    { refreshInterval }
  )

  return data
}
