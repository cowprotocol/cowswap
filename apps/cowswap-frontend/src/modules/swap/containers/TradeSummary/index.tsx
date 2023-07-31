import { Percent } from '@uniswap/sdk-core'

import { useHigherUSDValue } from 'legacy/hooks/useStablecoinPrice'
import TradeGp from 'legacy/state/swap/TradeGp'

import { TradeSummaryContent } from 'modules/swap/pure/TradeSummary'
import { useWalletDetails } from 'modules/wallet'

// Sub-components

export type TradeSummaryProps = {
  trade: TradeGp
  allowedSlippage: Percent
  showHelpers: boolean
  showFee: boolean
}

export function TradeSummary({ trade, ...restProps }: TradeSummaryProps) {
  const { allowsOffchainSigning } = useWalletDetails()
  const feeFiatValue = useHigherUSDValue(trade.fee.feeAsCurrency)

  return (
    <TradeSummaryContent
      {...restProps}
      trade={trade}
      fee={feeFiatValue}
      allowsOffchainSigning={allowsOffchainSigning}
    />
  )
}
