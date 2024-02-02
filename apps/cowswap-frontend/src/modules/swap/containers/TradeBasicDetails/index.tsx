import { INITIAL_ALLOWED_SLIPPAGE_PERCENT } from '@cowprotocol/common-const'
import { RowFixed, TokenAmount } from '@cowprotocol/ui'
import { Currency, CurrencyAmount, Percent, TradeType } from '@uniswap/sdk-core'

import { BoxProps } from 'rebass'

import TradeGp from 'legacy/state/swap/TradeGp'

import { RowFee } from 'modules/swap/containers/Row/RowFee'
import { RowReceivedAfterSlippage } from 'modules/swap/containers/Row/RowReceivedAfterSlippage'
import { RowSlippage } from 'modules/swap/containers/Row/RowSlippage'
import { useIsEoaEthFlow } from 'modules/swap/hooks/useIsEoaEthFlow'
import { StyledRowBetween, TextWrapper } from 'modules/swap/pure/Row/styled'
import { LowerSectionWrapper } from 'modules/swap/pure/styled'
import { useIsWrapOrUnwrap } from 'modules/trade/hooks/useIsWrapOrUnwrap'
import { ReceiveAmountTitle } from 'modules/trade/pure/ReceiveAmountTitle'
import { DividerHorizontal } from 'modules/trade/pure/Row/styled'
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

  const isExactIn = trade?.tradeType === TradeType.EXACT_INPUT

  const showRowSlippage =
    (isReviewSwap ||
      isEoaEthFlow ||
      isExpertMode ||
      !allowedSlippagePercent.equalTo(INITIAL_ALLOWED_SLIPPAGE_PERCENT)) &&
    !isWrapOrUnwrap

  const showRowReceivedAfterSlippage = (isReviewSwap || isExpertMode) && trade

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

      {isReviewSwap && (
        <>
          <StyledRowBetween>
            <RowFixed>
              <ReceiveAmountTitle>{isExactIn ? 'Expected to receive' : 'Expected to sell'}</ReceiveAmountTitle>
            </RowFixed>
            <TextWrapper>
              {trade && (
                <b>
                  <TokenAmount
                    amount={isExactIn ? trade?.outputAmount : trade.inputAmountWithFee}
                    tokenSymbol={isExactIn ? trade?.outputAmount.currency : trade.inputAmount.currency}
                    defaultValue="0"
                  />
                </b>
              )}
            </TextWrapper>
          </StyledRowBetween>
          <DividerHorizontal />
        </>
      )}

      {/* Slippage */}
      {showRowSlippage && <RowSlippage allowedSlippage={allowedSlippagePercent} />}

      {/*Minimum receive*/}
      {showRowReceivedAfterSlippage && (
        <RowReceivedAfterSlippage
          trade={trade}
          allowedSlippage={allowedSlippagePercent}
          highlightAmount={isReviewSwap}
          showHelpers={true}
        >
          {isReviewSwap ? (
            <ReceiveAmountTitle>{isExactIn ? 'Minimum receive' : 'Maximum sent'}</ReceiveAmountTitle>
          ) : null}
        </RowReceivedAfterSlippage>
      )}
    </LowerSectionWrapper>
  )
}
