import useSWR from 'swr'

import { getOrders } from '@cow/api/gnosisProtocol'
import { AMOUNT_OF_ORDERS_TO_FETCH } from 'constants/index'
import { supportedChainId } from 'utils/supportedChainId'
import { useWalletInfo } from '@cow/modules/wallet'
import { EnrichedOrder } from '@cowprotocol/cow-sdk'

export function useGpOrders(account?: string | null, refreshInterval?: number): EnrichedOrder[] | undefined {
  const { chainId: _chainId } = useWalletInfo()
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
