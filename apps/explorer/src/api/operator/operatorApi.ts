import { orderBookSDK } from 'cowSdk'

import { GetOrderParams, GetTxOrdersParams, RawOrder, RawTrade, GetTradesParams } from './types'

export { getAccountOrders } from './accountOrderUtils'

const backoffOpts = { numOfAttempts: 2 }

/**
 * Gets a single order by id.
 * Tries prod and staging (barn); returns the first found order so that a failure in one env does not hide the other.
 */
export async function getOrder(params: GetOrderParams): Promise<RawOrder | null> {
  const { networkId, orderId } = params
  const context = { chainId: networkId, backoffOpts }

  const orderPromise = orderBookSDK.getOrder(orderId, context).catch((error) => {
    console.error('[getOrder] Error getting PROD order', orderId, networkId, error)
    throw error
  })

  const orderPromiseBarn = orderBookSDK.getOrder(orderId, { ...context, env: 'staging' }).catch((error) => {
    console.error('[getOrder] Error getting BARN order', orderId, networkId, error)
    throw error
  })

  // Orders only exist in one env, so we use Promise.race instead of Promise.all to avoid waiting for all the retries on
  // the failing request:

  const result = await Promise.race([orderPromise, orderPromiseBarn])

  return result || null
}

/**
 * Gets a order list within Tx
 */
export async function getTxOrders(params: GetTxOrdersParams): Promise<RawOrder[]> {
  const { networkId, txHash } = params
  const context = { chainId: networkId, backoffOpts }

  console.log(`[getTxOrders] Fetching tx orders on network ${networkId}`)

  const orderPromises = orderBookSDK.getTxOrders(txHash, context).catch((error) => {
    console.error('[getTxOrders] Error getting PROD orders', networkId, txHash, error)
    throw error
  })

  const orderPromisesBarn = orderBookSDK
    .getTxOrders(txHash, {
      ...context,
      env: 'staging',
    })
    .catch((error) => {
      console.error('[getTxOrders] Error getting BARN orders', networkId, txHash, error)
      throw error
    })

  // A given txHash should only exist in one env, so we use Promise.race instead of Promise.all to avoid waiting for
  // all the retries on the failing request:

  const orders = await Promise.race([orderPromises, orderPromisesBarn])

  return orders
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
export async function getTrades(params: GetTradesParams): Promise<RawTrade[]> {
  const { networkId, owner, orderId: orderUid, offset, limit } = params
  const context = { chainId: networkId, backoffOpts }

  console.log(`[getTrades] Fetching trades on network ${networkId} with filters`, { owner, orderUid, offset, limit })

  const tradesPromise = orderBookSDK.getTrades({ owner, orderUid, offset, limit }, context).catch((error) => {
    console.error('[getTrades] Error getting PROD trades', params, error)
    return []
  })

  const tradesPromiseBarn = orderBookSDK
    .getTrades({ owner, orderUid, offset, limit }, { ...context, env: 'staging' })
    .catch((error) => {
      console.error('[getTrades] Error getting BARN trades', params, error)
      return []
    })

  // There might be orders in both PROD and BARN, so we need to merge the results of both request, as the SDK doesn't do
  // it yet:
  const trades = await Promise.all([tradesPromise, tradesPromiseBarn])

  return [...trades[0], ...trades[1]]
}
