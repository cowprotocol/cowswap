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

  return await safeAppsSdk.txs.send({ txs })
}
