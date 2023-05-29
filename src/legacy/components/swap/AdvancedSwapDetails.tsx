import { Percent } from '@uniswap/sdk-core'

import TradeGp from 'legacy/state/swap/TradeGp'

import { TradeSummary } from 'modules/swap/containers/TradeSummary'

export interface AdvancedSwapDetailsProps {
  trade?: TradeGp
  allowedSlippage: Percent
  showHelpers?: boolean
  showFee?: boolean
}

export function AdvancedSwapDetails({
  trade,
  allowedSlippage,
  showHelpers = true,
  showFee = true,
}: AdvancedSwapDetailsProps) {
  return !trade ? null : (
    <TradeSummary trade={trade} allowedSlippage={allowedSlippage} showHelpers={showHelpers} showFee={showFee} />
  )
}
