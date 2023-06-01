import { Currency, CurrencyAmount, Percent } from '@uniswap/sdk-core'

import { BoxProps } from 'rebass'

import { INITIAL_ALLOWED_SLIPPAGE_PERCENT } from 'legacy/constants'
import { useHigherUSDValue } from 'legacy/hooks/useStablecoinPrice'
import TradeGp from 'legacy/state/swap/TradeGp'

import { RowFee } from 'modules/swap/containers/Row/RowFee'
import { RowReceivedAfterSlippage } from 'modules/swap/containers/Row/RowReceivedAfterSlippage'
import { RowSlippage } from 'modules/swap/containers/Row/RowSlippage'
import { useIsEoaEthFlow } from 'modules/swap/hooks/useIsEoaEthFlow'
import { LowerSectionWrapper } from 'modules/swap/pure/styled'
import { useIsWrapOrUnwrap } from 'modules/trade/hooks/useIsWrapOrUnwrap'

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
  const isEoaEthFlow = useIsEoaEthFlow()
  const isWrapOrUnwrap = useIsWrapOrUnwrap()

  const showRowFee = trade || fee
  const showRowSlippage =
    (isEoaEthFlow || isExpertMode || !allowedSlippagePercent.equalTo(INITIAL_ALLOWED_SLIPPAGE_PERCENT)) &&
    !isWrapOrUnwrap
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
