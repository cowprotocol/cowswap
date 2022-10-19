import { CurrencyAmount, Percent, Token } from '@uniswap/sdk-core'
import TradeGp from 'state/swap/TradeGp'

import { useWalletInfo } from 'hooks/useWalletInfo'
import { useHigherUSDValue } from 'hooks/useStablecoinPrice'

// Sub-components
import { TradeSummaryContent } from '@cow/modules/swap/pure/TradeSummary'

export type TradeSummaryProps = {
  trade: TradeGp
  fee: CurrencyAmount<Token> | null
  allowedSlippage: Percent
  allowsOffchainSigning: boolean
  showHelpers: boolean
  showFee: boolean
}

export function TradeSummary({ trade, ...restProps }: Omit<TradeSummaryProps, 'fee' | 'allowsOffchainSigning'>) {
  const { allowsOffchainSigning } = useWalletInfo()
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
