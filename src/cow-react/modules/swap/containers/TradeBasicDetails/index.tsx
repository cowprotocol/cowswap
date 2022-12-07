import { BoxProps } from 'rebass'
import TradeGp from 'state/swap/TradeGp'
import { Currency, CurrencyAmount, Percent } from '@uniswap/sdk-core'
import { INITIAL_ALLOWED_SLIPPAGE_PERCENT } from 'constants/index'
import { useHigherUSDValue } from 'hooks/useStablecoinPrice'
import { LowerSectionWrapper } from '@cow/modules/swap/pure/styled'
import { RowFee } from '@cow/modules/swap/containers/Row/RowFee'
import { RowSlippage } from '@cow/modules/swap/containers/Row/RowSlippage'
import { RowReceivedAfterSlippage } from '@cow/modules/swap/containers/Row/RowReceivedAfterSlippage'
import { useIsEthFlow } from '@cow/modules/swap/hooks/useIsEthFlow'
import { useDetectNativeToken } from '@cow/modules/swap/hooks/useDetectNativeToken'

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
  const isEthFlow = useIsEthFlow()
  const { isWrapOrUnwrap } = useDetectNativeToken()

  const showRowFee = trade || fee
  const showRowSlippage =
    (isEthFlow || isExpertMode || !allowedSlippagePercent.equalTo(INITIAL_ALLOWED_SLIPPAGE_PERCENT)) && !isWrapOrUnwrap
  const showRowReceivedAfterSlippage = isExpertMode && trade

  return (
    <LowerSectionWrapper {...boxProps}>
      {/* Fees */}
      {showRowFee && (
        <RowFee
          trade={trade}
          showHelpers={true}
          allowsOffchainSigning={allowsOffchainSigning}
          fee={fee}
          feeFiatValue={feeFiatValue}
        />
      )}
      {/* Slippage */}
      {showRowSlippage && <RowSlippage allowedSlippage={allowedSlippagePercent} />}
      {showRowReceivedAfterSlippage && (
        <RowReceivedAfterSlippage trade={trade} allowedSlippage={allowedSlippagePercent} showHelpers={true} />
      )}
    </LowerSectionWrapper>
  )
}
