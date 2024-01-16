import { useWalletDetails } from '@cowprotocol/wallet'
import { Percent } from '@uniswap/sdk-core'

import TradeGp from 'legacy/state/swap/TradeGp'

import { TradeSummaryContent } from 'modules/swap/pure/TradeSummary'
import { useUsdAmount } from 'modules/usdAmount'

import { useFeatureFlags } from 'common/hooks/featureFlags/useFeatureFlags'

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
  const { swapZeroFee } = useFeatureFlags()

  return (
    <TradeSummaryContent
      {...restProps}
      trade={trade}
      fee={feeFiatValue}
      allowsOffchainSigning={allowsOffchainSigning}
      withoutFee={swapZeroFee}
    />
  )
}
