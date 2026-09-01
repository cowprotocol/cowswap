import { jotaiStore } from '@cowprotocol/core'
import { AccountAddress, PriceQuality, QuoteResults, SupportedChainId } from '@cowprotocol/cow-sdk'

import { captchaCanQuoteAtom } from 'entities/captcha/state/captchaCanQuoteAtom'
import { tradingSdk } from 'tradingSdk/tradingSdk'

import { getRemainderAmount } from 'legacy/state/orders/utils'

import { GenericOrder } from 'common/types'

// This quote is never placed as an order, it only drives the out-of-market badge and the estimated
// execution price in the orders table, so it skips the simulation `verified` would cost on a poll
// that runs per pending order. Not `fast`: that narrows the estimator set, which skews the price
// we display.
const ADVANCED_SETTINGS = { quoteRequest: { priceQuality: PriceQuality.OPTIMAL } }

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
      ADVANCED_SETTINGS,
    )

    return quote.quoteResults
  } catch {
    return null
  }
}
