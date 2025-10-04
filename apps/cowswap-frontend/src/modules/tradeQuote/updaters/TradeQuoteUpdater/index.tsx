import { useSetLocalTimeOffset } from 'common/containers/InvalidLocalTimeWarning/localTimeOffsetState'

import { useTradeQuote } from '../../hooks/useTradeQuote'
import { useTradeQuotePolling } from '../../hooks/useTradeQuotePolling'
import { TradeQuotePollingParameters } from '../../types'
import { getQuoteTimeOffset } from '../../utils/quoteDeadline'

export interface TradeQuoteUpdaterProps extends TradeQuotePollingParameters {}

export function TradeQuoteUpdater(props: TradeQuoteUpdaterProps): null {
  const quoteState = useTradeQuote()

  useTradeQuotePolling(props)

  useSetLocalTimeOffset(getQuoteTimeOffset(quoteState))

  return null
}
