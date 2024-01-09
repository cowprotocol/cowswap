import {
  GetOrderParams,
  GetOrdersParams,
  GetAccountOrdersParams,
  GetTxOrdersParams,
  GetTradesParams,
  RawOrder,
  RawTrade,
} from './types'

import { RAW_ORDER, RAW_TRADE } from '../../../test/data'
import { GetAccountOrdersResponse } from './accountOrderUtils'

export async function getOrder(params: GetOrderParams): Promise<RawOrder> {
  const { orderId } = params

  return {
    ...RAW_ORDER,
    uid: orderId,
  }
}

export async function getOrders(params: GetOrdersParams): Promise<RawOrder[]> {
  const { owner, networkId } = params

  const order = await getOrder({ networkId, orderId: 'whatever' })

  order.owner = owner || order.owner

  return [order]
}

export async function getAccountOrders(params: GetAccountOrdersParams): Promise<GetAccountOrdersResponse> {
  const { owner, networkId } = params

  const order = await getOrder({ networkId, orderId: 'whatever' })

  order.owner = owner || order.owner

  return { orders: [order], hasNextPage: false }
}

export async function getTxOrders(params: GetTxOrdersParams): Promise<RawOrder[]> {
  const { networkId } = params

  const order = await getOrder({ networkId, orderId: 'whatever' })

  return [order]
}

export async function getTrades(params: GetTradesParams): Promise<RawTrade[]> {
  const { owner, orderId } = params

  const trade = { ...RAW_TRADE }
  trade.owner = owner || trade.owner
  trade.orderUid = orderId || trade.orderUid

  return [trade]
}
