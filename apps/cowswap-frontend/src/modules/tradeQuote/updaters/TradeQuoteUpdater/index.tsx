import { useSetLocalTimeOffset } from 'common/containers/InvalidLocalTimeWarning/localTimeOffsetState'

import { useTradeQuote } from '../../hooks/useTradeQuote'
import { useTradeQuotePolling } from '../../hooks/useTradeQuotePolling'
import { getQuoteTimeOffset } from '../../utils/quoteDeadline'

export function TradeQuoteUpdater() {
  const quoteState = useTradeQuote()

  useTradeQuotePolling()

  useSetLocalTimeOffset(getQuoteTimeOffset(quoteState))

  return null
}
