import { SendTransactionsResponse } from '@safe-global/safe-apps-sdk'

import { createTwapOrderTxs } from './createTwapOrderTxs'

import { TwapOrderCreationContext } from '../hooks/useTwapOrderCreationContext'
import { ConditionalOrderParams, TWAPOrder } from '../types'

export async function settleTwapOrder(
  order: TWAPOrder,
  paramsStruct: ConditionalOrderParams,
  context: TwapOrderCreationContext
): Promise<SendTransactionsResponse> {
  const { safeAppsSdk } = context

  const txs = createTwapOrderTxs(order, paramsStruct, context)

  const response = await safeAppsSdk.txs.send({ txs })

  // TODO: process the sent transaction
  console.log('TWAP order: ', response)

  return response
}
