import { AccountAddress, QuoteResults, SupportedChainId } from '@cowprotocol/cow-sdk'

import { tradingSdk } from 'tradingSdk/tradingSdk'

import { getRemainderAmount } from 'legacy/state/orders/utils'

import { OrderToCheckFillability } from '../types'

export async function fetchOrderPrice(
  chainId: SupportedChainId,
  order: OrderToCheckFillability,
): Promise<QuoteResults | null> {
  const amount = getRemainderAmount(order.kind, order)

  try {
    return tradingSdk
      .getQuote({
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
      .then((res) => res.quoteResults)
  } catch {
    return null
  }
}
