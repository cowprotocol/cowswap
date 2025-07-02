import { useSetLocalTimeOffset } from 'common/containers/InvalidLocalTimeWarning/localTimeOffsetState'

import { useTradeQuote } from '../../hooks/useTradeQuote'
import { useTradeQuotePolling } from '../../hooks/useTradeQuotePolling'
import { getQuoteTimeOffset } from '../../utils/quoteDeadline'

export interface TradeQuoteUpdaterProps {
  isConfirmOpen: boolean
  isQuoteUpdatePossible: boolean
}

export function TradeQuoteUpdater({ isConfirmOpen, isQuoteUpdatePossible }: TradeQuoteUpdaterProps): null {
  const quoteState = useTradeQuote()

  useTradeQuotePolling(isConfirmOpen, isQuoteUpdatePossible)

  useSetLocalTimeOffset(getQuoteTimeOffset(quoteState))

  return null
}
