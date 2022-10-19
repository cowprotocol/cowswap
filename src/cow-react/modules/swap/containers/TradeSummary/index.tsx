import { CurrencyAmount, Token } from '@uniswap/sdk-core'
import { AdvancedSwapDetailsProps } from 'components/swap/AdvancedSwapDetails'

// Sub-components
import { useWalletInfo } from 'hooks/useWalletInfo'
import { useHigherUSDValue } from 'hooks/useStablecoinPrice'
import { TradeSummaryContent } from '@cow/modules/swap/pure/TradeSummary'

export type TradeSummaryProps = Required<AdvancedSwapDetailsProps> & {
  fee: CurrencyAmount<Token> | null
  allowsOffchainSigning: boolean
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
