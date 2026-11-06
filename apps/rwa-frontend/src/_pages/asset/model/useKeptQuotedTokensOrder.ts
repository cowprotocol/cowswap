import { useMemo, useState } from 'react'

import { keepPreviousOrder, type QuotedToken } from '../lib/quotedTokens'

import { getTokenKey } from '@/entities/asset'

interface RowOrder {
  /** The network and side the order was rendered for */
  orderKey: string
  tokenKeys: string[]
}

/** `sorted` in the row order last rendered for `orderKey`, as long as `keepPreviousOrder` allows */
export function useKeptQuotedTokensOrder(sorted: QuotedToken[], orderKey: string): QuotedToken[] {
  const [rowOrder, setRowOrder] = useState<RowOrder | null>(null)
  const previousOrder = rowOrder?.orderKey === orderKey ? rowOrder.tokenKeys : null
  const quotedTokens = useMemo(() => keepPreviousOrder(sorted, previousOrder), [sorted, previousOrder])
  const tokenKeys = quotedTokens.map(({ token }) => getTokenKey(token))

  if (previousOrder?.join() !== tokenKeys.join()) setRowOrder({ orderKey, tokenKeys })

  return quotedTokens
}
