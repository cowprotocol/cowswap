import { isSellOrder } from '@cowprotocol/common-utils'
import { OrderKind } from '@cowprotocol/cow-sdk'

import { TRADE_URL_BUY_AMOUNT_KEY, TRADE_URL_SELL_AMOUNT_KEY } from '../const/tradeUrl'

export type TradeSearchParams = {
  amount?: string
  kind?: OrderKind
  targetChainId?: number
}

/**
 * Add/replace searchParams to existing search string
 * @param search Existing search params string
 * @param searchParamsToAdd Stuff to add
 */
export function parameterizeTradeSearch(search: string, searchParamsToAdd?: TradeSearchParams): string {
  const searchParams = new URLSearchParams(search)

  const amountQueryKey = searchParamsToAdd?.kind
    ? isSellOrder(searchParamsToAdd.kind)
      ? TRADE_URL_SELL_AMOUNT_KEY
      : TRADE_URL_BUY_AMOUNT_KEY
    : undefined

  searchParamsToAdd?.amount && amountQueryKey && searchParams.set(amountQueryKey, searchParamsToAdd.amount)

  if (searchParamsToAdd?.targetChainId) {
    searchParams.set('targetChainId', searchParamsToAdd.targetChainId.toString())
  } else {
    searchParams.delete('targetChainId')
  }

  return searchParams.toString()
}
