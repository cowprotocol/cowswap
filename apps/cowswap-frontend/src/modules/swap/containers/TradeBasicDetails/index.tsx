import EqualIcon from '@cowprotocol/assets/cow-swap/equal.svg'
import { INITIAL_ALLOWED_SLIPPAGE_PERCENT } from '@cowprotocol/common-const'
import { RowFixed } from '@cowprotocol/ui'
import { Currency, CurrencyAmount, Percent } from '@uniswap/sdk-core'

import SVG from 'react-inlinesvg'
import { BoxProps } from 'rebass'

import TradeGp from 'legacy/state/swap/TradeGp'

import { RowFee } from 'modules/swap/containers/Row/RowFee'
import { RowReceivedAfterSlippage } from 'modules/swap/containers/Row/RowReceivedAfterSlippage'
import { RowSlippage } from 'modules/swap/containers/Row/RowSlippage'
import { useIsEoaEthFlow } from 'modules/swap/hooks/useIsEoaEthFlow'
import { StyledRowBetween, TextWrapper } from 'modules/swap/pure/Row/styled'
import { LowerSectionWrapper } from 'modules/swap/pure/styled'
import { useIsWrapOrUnwrap } from 'modules/trade/hooks/useIsWrapOrUnwrap'
import { useUsdAmount } from 'modules/usdAmount'

interface TradeBasicDetailsProp extends BoxProps {
  allowedSlippage: Percent | string
  isExpertMode: boolean
  allowsOffchainSigning: boolean
  trade?: TradeGp
  fee: CurrencyAmount<Currency>
  isReviewSwap?: boolean
}

export function TradeBasicDetails(props: TradeBasicDetailsProp) {
  const { trade, allowedSlippage, isExpertMode, allowsOffchainSigning, fee, isReviewSwap, ...boxProps } = props
  const allowedSlippagePercent = !(allowedSlippage instanceof Percent)
    ? INITIAL_ALLOWED_SLIPPAGE_PERCENT
    : allowedSlippage

  // trades are null when there is a fee quote error e.g
  // so we can take both
  const feeFiatValue = useUsdAmount(fee).value
  const isEoaEthFlow = useIsEoaEthFlow()
  const isWrapOrUnwrap = useIsWrapOrUnwrap()

  const showRowSlippage =
    (isEoaEthFlow || isExpertMode || !allowedSlippagePercent.equalTo(INITIAL_ALLOWED_SLIPPAGE_PERCENT)) &&
    !isWrapOrUnwrap
  const showRowReceivedAfterSlippage = isExpertMode && trade

  return (
    <LowerSectionWrapper {...boxProps}>
      {/* Fees */}
      <RowFee
        trade={trade}
        showHelpers={true}
        allowsOffchainSigning={allowsOffchainSigning}
        fee={fee}
        feeFiatValue={feeFiatValue}
      />

      {/* TODO: Add Expected to receive */}
      {isReviewSwap && (
        <StyledRowBetween dividerBottom>
          <RowFixed>
            <SVG src={EqualIcon} title="= expected to receive" />{' '}
            <TextWrapper>
              <b>Expected to receive</b>
            </TextWrapper>
          </RowFixed>
          <TextWrapper>- AMOUNT HERE -</TextWrapper>
        </StyledRowBetween>
      )}

      {/* Slippage */}
      {showRowSlippage && <RowSlippage allowedSlippage={allowedSlippagePercent} />}
      {showRowReceivedAfterSlippage && (
        <RowReceivedAfterSlippage trade={trade} allowedSlippage={allowedSlippagePercent} showHelpers={true} />
      )}

      {/* TODO: Add Minimum receive */}
      {isReviewSwap && (
        <StyledRowBetween>
          <RowFixed>
            <SVG src={EqualIcon} title="= expected to receive" />{' '}
            <TextWrapper>
              <b>Minimum receive</b>
            </TextWrapper>
          </RowFixed>
          <TextWrapper>- AMOUNT HERE -</TextWrapper>
        </StyledRowBetween>
      )}
    </LowerSectionWrapper>
  )
}
