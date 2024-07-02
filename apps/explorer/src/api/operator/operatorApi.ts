import { Address, UID } from '@cowprotocol/cow-sdk'

import { orderBookSDK } from 'cowSdk'

import { GetOrderParams, GetTxOrdersParams, RawOrder, RawTrade, WithNetworkId } from './types'

export { getAccountOrders } from './accountOrderUtils'

const backoffOpts = { numOfAttempts: 2 }

/**
 * Gets a single order by id
 */
export async function getOrder(params: GetOrderParams): Promise<RawOrder | null> {
  const { networkId, orderId } = params

  return orderBookSDK.getOrderMultiEnv(orderId, { chainId: networkId })
}

/**
 * Gets a order list within Tx
 */
export async function getTxOrders(params: GetTxOrdersParams): Promise<RawOrder[]> {
  const { networkId, txHash } = params

  console.log(`[getTxOrders] Fetching tx orders on network ${networkId}`)

  const orderPromises = orderBookSDK.getTxOrders(txHash, { chainId: networkId, backoffOpts }).catch((error) => {
    console.error('[getTxOrders] Error getting PROD orders', networkId, txHash, error)
    return []
  })
  const orderPromisesBarn = orderBookSDK
    .getTxOrders(txHash, {
      chainId: networkId,
      env: 'staging',
      backoffOpts,
    })
    .catch((error) => {
      console.error('[getTxOrders] Error getting BARN orders', networkId, txHash, error)
      return []
    })

  // sdk not merging array responses yet
  const orders = await Promise.all([orderPromises, orderPromisesBarn])

  return [...orders[0], ...orders[1]]
}

/**
 * Gets a list of trades
 *
 * Optional filters:
 *  - owner: address
 *  - orderId: string
 *
 * Both filters cannot be used at the same time
 */
export async function getTrades(
  params: {
    owner?: Address
    orderId?: UID
  } & WithNetworkId
): Promise<RawTrade[]> {
  const { networkId, owner, orderId: orderUid } = params
  console.log(`[getTrades] Fetching trades on network ${networkId} with filters`, { owner, orderUid })

  const tradesPromise = orderBookSDK.getTrades({ owner, orderUid }, { chainId: networkId }).catch((error) => {
    console.error('[getTrades] Error getting PROD trades', params, error)
    return []
  })
  const tradesPromiseBarn = orderBookSDK
    .getTrades({ owner, orderUid }, { chainId: networkId, env: 'staging' })
    .catch((error) => {
      console.error('[getTrades] Error getting BARN trades', params, error)
      return []
    })

  // sdk not merging array responses yet
  const trades = await Promise.all([tradesPromise, tradesPromiseBarn])

  return [...trades[0], ...trades[1]]
}
