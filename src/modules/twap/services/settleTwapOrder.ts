import { createTwapOrderTxs } from './createTwapOrderTxs'
import { TWAPOrder } from '../types'
import { TwapOrderCreationContext } from '../hooks/useTwapOrderCreationContext'
import { SendTransactionsResponse } from '@safe-global/safe-apps-sdk'

export async function settleTwapOrder(
  order: TWAPOrder,
  context: TwapOrderCreationContext
): Promise<SendTransactionsResponse> {
  const { safeAppsSdk } = context

  const txs = createTwapOrderTxs(order, context)

  const response = await safeAppsSdk.txs.send({ txs })

  // TODO: process the sent transaction
  console.log('TWAP order: ', response)

  return response
}
