import { AccountAddress, QuoteResults, SupportedChainId } from '@cowprotocol/cow-sdk'

import { tradingSdk } from 'tradingSdk/tradingSdk'

import { getRemainderAmount } from 'legacy/state/orders/utils'

import { GenericOrder } from 'common/types'

export async function fetchOrderPrice(chainId: SupportedChainId, order: GenericOrder): Promise<QuoteResults | null> {
  const amount = getRemainderAmount(order.kind, order)

  try {
    const quote = await tradingSdk.getQuote({
      chainId,
      kind: order.kind,
      owner: order.owner as AccountAddress,
      sellToken: order.inputToken.address,
      sellTokenDecimals: order.inputToken.decimals,
      buyToken: order.outputToken.address,
      buyTokenDecimals: order.outputToken.decimals,
      amount,
      receiver: order.receiver,
      partiallyFillable: order.partiallyFillable,
    })

    return quote.quoteResults
  } catch {
    return null
  }
}
