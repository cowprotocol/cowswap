import { orderBookSDK } from 'cowSdk'

import { backoffOpts } from './operator.constants'
import {
  GetOrderParams,
  GetTxOrdersParams,
  RawOrder,
  RawTrade,
  GetTradesParams,
  GetOrderCompetitionStatusParams,
  OrderCompetitionStatus,
} from './types'

export { getAccountOrders } from './accountOrderUtils'

/**
 * Gets a single order by id.
 *
 * Uses `Promise.any` to fetch from both prod and barn at the same time. The first fulfilled promise wins.
 */
export async function getOrder(params: GetOrderParams): Promise<RawOrder> {
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

  return Promise.any([orderPromise, orderPromiseBarn])
}

/** Thrown when an env returns [] so Promise.any waits for the other; not logged. */
class EmptyTxOrdersResultError extends Error {
  override readonly name = 'EmptyTxOrdersResultError'
}

/**
 * Gets orders for a tx from prod and staging (barn).
 *
 * Uses `Promise.any`, with some custom error handling, so:
 * - The first non-empty array wins.
 * - If one env returns `[]`, we still wait for the other.
 * - If both envs return `[]`, we return `[]`.
 * - If both fail, throws the corresponding `AggregateError`.
 */
export async function getTxOrders(params: GetTxOrdersParams): Promise<RawOrder[]> {
  const { networkId, txHash } = params
  const context = { chainId: networkId, backoffOpts }

  console.log(`[getTxOrders] Fetching tx orders on network ${networkId}`)

  const rejectIfEmpty = (orders: RawOrder[]): RawOrder[] => {
    if (!orders?.length) throw new EmptyTxOrdersResultError()
    return orders
  }

  const orderPromises = orderBookSDK
    .getTxOrders(txHash, context)
    .then(rejectIfEmpty)
    .catch((error) => {
      if (!(error instanceof EmptyTxOrdersResultError)) {
        console.error('[getTxOrders] Error getting PROD orders', networkId, txHash, error)
      }

      throw error
    })

  const orderPromisesBarn = orderBookSDK
    .getTxOrders(txHash, { ...context, env: 'staging' })
    .then(rejectIfEmpty)
    .catch((error) => {
      if (!(error instanceof EmptyTxOrdersResultError)) {
        console.error('[getTxOrders] Error getting BARN orders', networkId, txHash, error)
      }

      throw error
    })

  return Promise.any([orderPromises, orderPromisesBarn]).catch((error) => {
    if (error instanceof AggregateError && error.errors?.some((e) => e instanceof EmptyTxOrdersResultError)) {
      return []
    }

    throw error
  })
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

/**
 * Gets order competition status from prod and staging (barn).
 *
 * Uses `Promise.any`, so the first fulfilled response wins.
 * Returns `undefined` if neither environment has status data.
 */
export async function getOrderCompetitionStatus(
  params: GetOrderCompetitionStatusParams,
): Promise<OrderCompetitionStatus | undefined> {
  const { networkId, orderId } = params
  const context = { chainId: networkId, backoffOpts }

  const statusPromise = orderBookSDK.getOrderCompetitionStatus(orderId, context).catch((error) => {
    console.error('[getOrderCompetitionStatus] Error getting PROD order status', orderId, networkId, error)
    throw error
  })

  const statusPromiseBarn = orderBookSDK
    .getOrderCompetitionStatus(orderId, { ...context, env: 'staging' })
    .catch((error) => {
      console.error('[getOrderCompetitionStatus] Error getting BARN order status', orderId, networkId, error)
      throw error
    })

  return Promise.any([statusPromise, statusPromiseBarn]).catch(() => undefined)
}
