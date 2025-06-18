import { useSetLocalTimeOffset } from 'common/containers/InvalidLocalTimeWarning/localTimeOffsetState'

import { useTradeQuote } from '../../hooks/useTradeQuote'
import { useTradeQuotePolling } from '../../hooks/useTradeQuotePolling'
import { getQuoteTimeOffset } from '../../utils/quoteDeadline'

export interface TradeQuoteUpdaterProps {
  isConfirmOpen: boolean
}

export function TradeQuoteUpdater({ isConfirmOpen }: TradeQuoteUpdaterProps): null {
  const quoteState = useTradeQuote()

  useTradeQuotePolling(isConfirmOpen)

  useSetLocalTimeOffset(getQuoteTimeOffset(quoteState))

  return null
}
