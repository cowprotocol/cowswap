import { BoxProps } from 'rebass'
import TradeGp from 'state/swap/TradeGp'
import { Currency, CurrencyAmount } from '@uniswap/sdk-core'
import { useExpertModeManager, useUserSlippageToleranceWithDefault } from 'state/user/hooks'
import { INITIAL_ALLOWED_SLIPPAGE_PERCENT } from 'constants/index'
import { useWalletInfo } from 'hooks/useWalletInfo'
import { useHigherUSDValue } from 'hooks/useStablecoinPrice'
import { LowerSectionWrapper } from 'pages/Swap/styled'
import { RowFee } from 'components/swap/TradeSummary/RowFee'
import { RowSlippage } from 'components/swap/TradeSummary/RowSlippage'
import { RowReceivedAfterSlippage } from 'components/swap/TradeSummary/RowReceivedAfterSlippage'

interface TradeBasicDetailsProp extends BoxProps {
  trade?: TradeGp
  fee: CurrencyAmount<Currency>
}

export function TradeBasicDetails({ trade, fee, ...boxProps }: TradeBasicDetailsProp) {
  const allowedSlippage = useUserSlippageToleranceWithDefault(INITIAL_ALLOWED_SLIPPAGE_PERCENT)
  const [isExpertMode] = useExpertModeManager()
  const { allowsOffchainSigning } = useWalletInfo()

  // trades are null when there is a fee quote error e.g
  // so we can take both
  const feeFiatValue = useHigherUSDValue(trade?.fee.feeAsCurrency || fee)

  return (
    <LowerSectionWrapper {...boxProps}>
      {/* Fees */}
      {(trade || fee) && (
        <RowFee
          trade={trade}
          showHelpers={true}
          allowsOffchainSigning={allowsOffchainSigning}
          fee={fee}
          feeFiatValue={feeFiatValue}
        />
      )}

      {isExpertMode && trade && (
        <>
          {/* Slippage */}
          <RowSlippage allowedSlippage={allowedSlippage} />

          {/* Min/Max received */}
          <RowReceivedAfterSlippage
            trade={trade}
            allowedSlippage={allowedSlippage}
            showHelpers={true}
            allowsOffchainSigning={allowsOffchainSigning}
          />
        </>
      )}
    </LowerSectionWrapper>
  )
}
