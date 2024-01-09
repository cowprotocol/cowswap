import { GetOrderParams, GetTxOrdersParams, RawOrder } from 'api/operator'
import { NETWORK_ID_SEARCH_LIST } from 'apps/explorer/const'
import { Network } from 'types'

export type SingleOrder = RawOrder | null
export type MultipleOrders = RawOrder[] | null

export interface GetOrderResult<R> {
  order: R | null
  errorOrderPresentInNetworkId?: Network
}

type GetOrderParamsApi<T> = {
  [K in keyof T]: T[K]
}

interface GetOrderApiFn<T, R> {
  (params: GetOrderParamsApi<T>): Promise<R>
}

export type GetOrderApi<T, R> = {
  api: GetOrderApiFn<T, R>
  defaultParams: GetOrderParamsApi<T>
}

type TypeOrderApiParams = GetOrderParams | GetTxOrdersParams

export async function tryGetOrderOnAllNetworksAndEnvironments<TypeOrderResult>(
  networkId: Network,
  getOrderApi: GetOrderApi<TypeOrderApiParams, TypeOrderResult>,
  networkIdSearchListRemaining: Network[] = NETWORK_ID_SEARCH_LIST,
): Promise<GetOrderResult<TypeOrderResult>> {
  // Get order
  let order = null
  try {
    order = await getOrderApi.api({ ...getOrderApi.defaultParams, networkId })
  } catch (error) {
    console.log('Order not found', { ...getOrderApi.defaultParams, networkId })
  }

  if (order || networkIdSearchListRemaining.length === 0) {
    // We found the order in the right network
    // ...or we have no more networks in which to continue looking
    // so we return the "order" (can be null if it wasn't found in any network)
    return { order }
  }

  // If we didn't find the order in the current network, we look in different networks
  const remainingNetworkIds = networkIdSearchListRemaining.filter((network) => network != networkId)

  // Try to get the order in another network (to see if the ID is OK, but the network not)
  for (const currentNetworkId of remainingNetworkIds) {
    let order = null
    try {
      order = await getOrderApi.api({ ...getOrderApi.defaultParams, networkId: currentNetworkId })
    } catch (error) {
      console.log('Order not found', { ...getOrderApi.defaultParams, networkId: currentNetworkId })
    }

    if (order) {
      // If the order exist in the other network
      return {
        order: order,
        errorOrderPresentInNetworkId: currentNetworkId,
      }
    }
  }

  return {
    order,
  }
}
