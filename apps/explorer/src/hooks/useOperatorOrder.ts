import { useCallback, useEffect, useState } from 'react'

import { Order, getOrder, GetOrderParams } from 'api/operator'

import { getShortOrderId, transformOrder } from 'utils'

import { useNetworkId } from 'state/network'

import { useMultipleErc20 } from './useErc20'
import { Errors, Network, UiError } from 'types'
import {
  GetOrderApi,
  GetOrderResult,
  SingleOrder,
  tryGetOrderOnAllNetworksAndEnvironments,
} from 'services/helpers/tryGetOrderOnAllNetworks'

type UseOrderResult = {
  order: Order | null
  error?: UiError
  isLoading: boolean
  errorOrderPresentInNetworkId: Network | null
  forceUpdate?: () => void
}

function _getOrder(networkId: Network, orderId: string): Promise<GetOrderResult<SingleOrder>> {
  const defaultParams: GetOrderParams = { networkId, orderId }
  const getOrderApi: GetOrderApi<GetOrderParams, SingleOrder> = {
    api: (_defaultParams) => getOrder(_defaultParams),
    defaultParams,
  }

  return tryGetOrderOnAllNetworksAndEnvironments<SingleOrder>(networkId, getOrderApi)
}

export function useOrderByNetwork(orderId: string, networkId: Network | null, updateInterval = 0): UseOrderResult {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<UiError>()
  const [order, setOrder] = useState<Order | null>(null)
  const [errorOrderPresentInNetworkId, setErrorOrderPresentInNetworkId] = useState<Network | null>(null)
  // Hack to force component to update itself on demand
  const [forcedUpdate, setForcedUpdate] = useState({})
  const forceUpdate = useCallback((): void => setForcedUpdate({}), [])

  useEffect(() => {
    async function fetchOrder(): Promise<void> {
      if (!networkId) return

      setIsLoading(true)

      try {
        const { order: rawOrder, errorOrderPresentInNetworkId: errorOrderPresentInNetworkIdRaw } = await _getOrder(
          networkId,
          orderId,
        )
        console.log({ rawOrder, errorOrderPresentInNetworkIdRaw })
        if (rawOrder) {
          setOrder(transformOrder(rawOrder))
        }
        if (errorOrderPresentInNetworkIdRaw) {
          setErrorOrderPresentInNetworkId(errorOrderPresentInNetworkIdRaw)
        }
        setError(undefined)
      } catch (e) {
        const msg = `Failed to fetch order`
        console.error(`${msg}: ${orderId}`, e.message)
        setError({ message: `${msg}: ${getShortOrderId(orderId)}`, type: 'error' })
      } finally {
        setIsLoading(false)
      }
    }

    fetchOrder()
  }, [networkId, orderId, forcedUpdate])

  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null

    // Only start the interval when:
    // 1. Hook is configured to do so (`updateInterval` > 0)
    // 2. Order exists
    // 3. Order is not expired
    if (updateInterval && order && order.expirationDate.getTime() > Date.now()) {
      intervalId = setInterval(forceUpdate, updateInterval)
    }

    return (): void => {
      intervalId && clearInterval(intervalId)
    }
  }, [forceUpdate, order, updateInterval])

  return { order, isLoading, error, errorOrderPresentInNetworkId, forceUpdate }
}

export function useOrder(orderId: string, updateInterval?: number): UseOrderResult {
  const networkId = useNetworkId()
  return useOrderByNetwork(orderId, networkId, updateInterval)
}

type UseOrderAndErc20sResult = {
  order: Order | null
  isLoading: boolean
  errors: Errors
  errorOrderPresentInNetworkId: Network | null
}

/**
 * Aggregates the fetching of the order and related erc20s
 * Optionally sets an interval of how often to update Open orders
 *
 * @param orderId The order id
 * @param updateInterval [Optional] How often should try to update the order
 */
export function useOrderAndErc20s(orderId: string, updateInterval = 0): UseOrderAndErc20sResult {
  const networkId = useNetworkId() || undefined

  const {
    order,
    isLoading: isOrderLoading,
    error: orderError,
    errorOrderPresentInNetworkId,
  } = useOrder(orderId, updateInterval)

  const addresses = order ? [order.buyTokenAddress, order.sellTokenAddress] : []

  const { value, isLoading: areErc20Loading, error: erc20Errors } = useMultipleErc20({ networkId, addresses })

  const errors = { ...erc20Errors }
  if (orderError) {
    errors[orderId] = orderError
  }

  if (order && value) {
    order.buyToken = value[order?.buyTokenAddress || '']
    order.sellToken = value[order?.sellTokenAddress || '']
  }

  return { order, isLoading: isOrderLoading || areErc20Loading, errors, errorOrderPresentInNetworkId }
}
