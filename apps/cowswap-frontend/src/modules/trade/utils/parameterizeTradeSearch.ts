import { OrderKind } from '@cowprotocol/cow-sdk'

import { TRADE_URL_BUY_AMOUNT_KEY, TRADE_URL_SELL_AMOUNT_KEY } from '../const/tradeUrl'

export type TradeSearchParams = {
  amount?: string | undefined
  kind?: OrderKind
  sellAmount?: string | undefined
  buyAmount?: string | undefined
}

/**
 * Add/replace searchParams to existing search string
 * @param search Existing search params string
 * @param searchParamsToAdd Stuff to add
 */
export function parameterizeTradeSearch(search: string, searchParamsToAdd?: TradeSearchParams): string {
  const searchParams = new URLSearchParams(search)

  // TODO: think about how to deal with buy limit orders

  if (searchParamsToAdd?.amount) {
    const amountQueryKey =
      searchParamsToAdd.kind === OrderKind.SELL ? TRADE_URL_SELL_AMOUNT_KEY : TRADE_URL_BUY_AMOUNT_KEY
    searchParams.set(amountQueryKey, searchParamsToAdd.amount)
  } else {
    if (searchParamsToAdd?.sellAmount) {
      searchParams.set(TRADE_URL_SELL_AMOUNT_KEY, searchParamsToAdd.sellAmount)
    }
    if (searchParamsToAdd?.buyAmount) {
      searchParams.set(TRADE_URL_BUY_AMOUNT_KEY, searchParamsToAdd.buyAmount)
    }
  }

  return searchParams.toString()
}
