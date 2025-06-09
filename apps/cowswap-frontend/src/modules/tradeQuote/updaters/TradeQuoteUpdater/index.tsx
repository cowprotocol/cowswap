import { useSetLocalTimeOffset } from 'common/containers/InvalidLocalTimeWarning/localTimeOffsetState'

import { useTradeQuote } from '../../hooks/useTradeQuote'
import { useTradeQuotePolling } from '../../hooks/useTradeQuotePolling'
import { getQuoteTimeOffset } from '../../utils/quoteDeadline'

export interface TradeQuoteUpdaterProps {
  isConfirmOpen: boolean
  enableSmartSlippage?: boolean
}

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function TradeQuoteUpdater({ isConfirmOpen, enableSmartSlippage = false }: TradeQuoteUpdaterProps) {
  const quoteState = useTradeQuote()

  useTradeQuotePolling(isConfirmOpen, enableSmartSlippage)

  useSetLocalTimeOffset(getQuoteTimeOffset(quoteState))

  return null
}
