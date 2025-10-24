import { useSmartSlippageFromQuote } from 'modules/tradeQuote'

import { useIsSlippageModified } from './useIsSlippageModified'
import { useTradeSlippage } from './useTradeSlippage'

import { useSlippageWarningParams } from '../../tradeWidgetAddons/containers/TransactionSlippageInput/hooks/useSlippageWarningParams'

/**
 * Determines if the slippage field should be shown outside the accordion.
 *
 * Returns true when:
 * 1. User manually changed slippage from default, OR
 * 2. Slippage warning is being shown (too high or too low)
 *
 * This implements the requirement from GitHub issue #6317 to make the slippage
 * field more prominent when user interaction or warnings require attention.
 */
export function useShouldShowSlippageOutsideAccordion(): boolean {
  const isSlippageModified = useIsSlippageModified()
  const swapSlippage = useTradeSlippage()
  const smartSlippage = useSmartSlippageFromQuote()
  const slippageWarningParams = useSlippageWarningParams(swapSlippage, smartSlippage, isSlippageModified)

  // Show outside if user manually changed the slippage
  if (isSlippageModified) {
    return true
  }

  // Show outside if a slippage warning is being displayed
  if (slippageWarningParams && (slippageWarningParams.tooHigh || slippageWarningParams.tooLow)) {
    return true
  }

  return false
}
