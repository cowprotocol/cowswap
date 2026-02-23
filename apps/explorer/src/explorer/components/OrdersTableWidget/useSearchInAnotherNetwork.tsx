import { useCallback, useEffect, useMemo, useState } from 'react'

import { useAvailableChains } from '@cowprotocol/common-hooks'

import { BlockchainNetwork } from './context/OrdersTableContext'

import { getAccountOrders, Order } from '../../../api/operator'
import { Network } from '../../../types'

interface OrdersInNetwork {
  network: number
}

export interface ResultSearchInAnotherNetwork {
  isLoading: boolean
  ordersInNetworks: OrdersInNetwork[]
  setLoadingState: (value: boolean) => void
  errorMsg: string | null
}

export const useSearchInAnotherNetwork = (
  networkId: BlockchainNetwork,
  ownerAddress: string,
  orders: Order[] | undefined,
): ResultSearchInAnotherNetwork => {
  const [ordersInNetworks, setOrdersInNetworks] = useState<OrdersInNetwork[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const isOrdersLengthZero = !orders || orders.length === 0
  const [error, setError] = useState<string | null>(null)
  const availableChains = useAvailableChains()

  const fetchAnotherNetworks = useCallback(
    async (_networkId: Network) => {
      setIsLoading(true)
      setError(null)
      const promises = availableChains
        .filter((net) => net !== _networkId)
        .map((network) =>
          getAccountOrders({ networkId: network, owner: ownerAddress, offset: 0, limit: 1 })
            .then((response) => {
              if (!response.orders.length) return

              return { network }
            })
            .catch((e) => {
              // Msg for when there are no orders on any network and a request has failed
              setError('An error has occurred while requesting the data.')
              console.error(`Failed to fetch order in ${Network[network]}`, e)
            }),
        )

      const networksHaveOrders = (await Promise.allSettled(promises)).filter(
        (e) => e.status === 'fulfilled' && e.value?.network,
      )
      setOrdersInNetworks(networksHaveOrders.map((e) => (e.status === 'fulfilled' ? e.value : e.reason)))
      setIsLoading(false)
    },
    [ownerAddress, availableChains],
  )

  useEffect(() => {
    if (!networkId || !isOrdersLengthZero) return

    fetchAnotherNetworks(networkId)
  }, [fetchAnotherNetworks, isOrdersLengthZero, networkId])

  return useMemo(
    () => ({ isLoading, ordersInNetworks, setLoadingState: setIsLoading, errorMsg: error }),
    [isLoading, ordersInNetworks, setIsLoading, error],
  )
}
