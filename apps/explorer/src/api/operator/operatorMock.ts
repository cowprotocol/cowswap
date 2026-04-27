import { GetAccountOrdersResponse } from './accountOrderUtils'
import {
  GetOrderParams,
  GetOrdersParams,
  GetAccountOrdersParams,
  GetOrderCompetitionStatusParams,
  GetSolverCompetitionByTxHashParams,
  GetTxOrdersParams,
  GetTradesParams,
  OrderCompetitionStatus,
  SolverCompetitionResponse,
  RawOrder,
  RawTrade,
} from './types'

import { RAW_ORDER, RAW_TRADE } from '../../test/data'

export async function getAccountOrders(params: GetAccountOrdersParams): Promise<GetAccountOrdersResponse> {
  const { owner, networkId } = params

  const order = await getOrder({ networkId, orderId: 'whatever' })

  order.owner = owner || order.owner

  return { orders: [order], hasNextPage: false }
}

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

export async function getTrades(params: GetTradesParams): Promise<RawTrade[]> {
  const { owner, orderId } = params

  const trade = { ...RAW_TRADE }
  trade.owner = owner || trade.owner
  trade.orderUid = orderId || trade.orderUid

  return [trade]
}

export async function getTxOrders(params: GetTxOrdersParams): Promise<RawOrder[]> {
  const { networkId } = params

  const order = await getOrder({ networkId, orderId: 'whatever' })

  return [order]
}

export const getOrderCompetitionStatus = async (
  _params: GetOrderCompetitionStatusParams,
): Promise<OrderCompetitionStatus | undefined> => ({
  type: 'traded' as OrderCompetitionStatus['type'],
  value: [{ solver: 'mock-solver', executedAmounts: { sell: '1', buy: '1' } }],
})

export const getSolverCompetitionByTxHash = async (
  _params: GetSolverCompetitionByTxHashParams,
): Promise<SolverCompetitionResponse | undefined> => undefined
