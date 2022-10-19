import { BoxProps } from 'rebass'
import TradeGp from 'state/swap/TradeGp'
import { Currency, CurrencyAmount, Percent } from '@uniswap/sdk-core'
import { INITIAL_ALLOWED_SLIPPAGE_PERCENT } from 'constants/index'
import { useHigherUSDValue } from 'hooks/useStablecoinPrice'
import { LowerSectionWrapper } from '@cow/modules/swap/pure/styled'
import { RowFee } from '@cow/modules/swap/containers/RowFee'
import { RowSlippage } from '@cow/modules/swap/containers/RowSlippage'
import { RowReceivedAfterSlippage } from '@cow/modules/swap/containers/RowReceivedAfterSlippage'

interface TradeBasicDetailsProp extends BoxProps {
  allowedSlippage: Percent | string
  isExpertMode: boolean
  allowsOffchainSigning: boolean
  trade?: TradeGp
  fee: CurrencyAmount<Currency>
}

export function TradeBasicDetails(props: TradeBasicDetailsProp) {
  const { trade, allowedSlippage, isExpertMode, allowsOffchainSigning, fee, ...boxProps } = props
  const allowedSlippagePercent = !(allowedSlippage instanceof Percent)
    ? INITIAL_ALLOWED_SLIPPAGE_PERCENT
    : allowedSlippage

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
          <RowSlippage allowedSlippage={allowedSlippagePercent} />

          {/* Min/Max received */}
          <RowReceivedAfterSlippage trade={trade} allowedSlippage={allowedSlippagePercent} showHelpers={true} />
        </>
      )}
    </LowerSectionWrapper>
  )
}
