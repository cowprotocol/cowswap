import { Percent } from '@uniswap/sdk-core'
import TradeGp from 'state/swap/TradeGp'

import { useWalletDetails } from 'modules/wallet'
import { useHigherUSDValue } from 'hooks/useStablecoinPrice'

// Sub-components
import { TradeSummaryContent } from 'modules/swap/pure/TradeSummary'

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
