import { jotaiStore } from '@cowprotocol/core'
import { AccountAddress, QuoteResults, SupportedChainId } from '@cowprotocol/cow-sdk'

import { captchaCanQuoteAtom } from 'entities/captcha/state/captchaCanQuoteAtom'
import { tradingSdk, QUOTE_SETTINGS } from 'tradingSdk/tradingSdk'

import { getRemainderAmount } from 'legacy/state/orders/utils'

import { GenericOrder } from 'common/types'

export async function fetchOrderPrice(chainId: SupportedChainId, order: GenericOrder): Promise<QuoteResults | null> {
  if (!jotaiStore.get(captchaCanQuoteAtom)) return null

  const amount = getRemainderAmount(order.kind, order)

  try {
    const quote = await tradingSdk.getQuote(
      {
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
      },
      QUOTE_SETTINGS,
    )

    return quote.quoteResults
  } catch {
    return null
  }
}
