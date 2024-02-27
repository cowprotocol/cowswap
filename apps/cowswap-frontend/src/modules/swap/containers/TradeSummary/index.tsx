import { useWalletDetails } from '@cowprotocol/wallet'
import { Percent } from '@uniswap/sdk-core'

import TradeGp from 'legacy/state/swap/TradeGp'

import { TradeSummaryContent } from 'modules/swap/pure/TradeSummary'
import { useUsdAmount } from 'modules/usdAmount'

// Sub-components

export type TradeSummaryProps = {
  trade: TradeGp
  allowedSlippage: Percent
  showHelpers: boolean
  showFee: boolean
}

export function TradeSummary({ trade, ...restProps }: TradeSummaryProps) {
  const { allowsOffchainSigning } = useWalletDetails()
  const feeFiatValue = useUsdAmount(trade.fee.feeAsCurrency).value

  return (
    <TradeSummaryContent
      {...restProps}
      trade={trade}
      fee={feeFiatValue}
      partnerFee={trade.partnerFee}
      allowsOffchainSigning={allowsOffchainSigning}
    />
  )
}
