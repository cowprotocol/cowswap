import { Percent } from '@uniswap/sdk-core'

import TradeGp from 'legacy/state/swap/TradeGp'

import { useHigherUSDValue } from 'modules/fiatAmount'
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
  const feeFiatValue = useHigherUSDValue(trade.fee.feeAsCurrency).value

  return (
    <TradeSummaryContent
      {...restProps}
      trade={trade}
      fee={feeFiatValue}
      allowsOffchainSigning={allowsOffchainSigning}
    />
  )
}
