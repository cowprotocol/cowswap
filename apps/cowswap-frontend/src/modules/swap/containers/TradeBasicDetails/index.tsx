import React from 'react'

import { INITIAL_ALLOWED_SLIPPAGE_PERCENT } from '@cowprotocol/common-const'
import { RowFixed, TokenAmount } from '@cowprotocol/ui'
import { Currency, CurrencyAmount, Percent, TradeType } from '@uniswap/sdk-core'

import { BoxProps } from 'rebass'

import TradeGp from 'legacy/state/swap/TradeGp'

import { useInjectedWidgetParams } from 'modules/injectedWidget'
import { RowNetworkCosts, RowPartnerFee } from 'modules/swap/containers/Row/RowFee'
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
  allowsOffchainSigning: boolean
  trade?: TradeGp
  fee: CurrencyAmount<Currency>
  isReviewSwap?: boolean
  hideSlippage?: boolean
}

export function TradeBasicDetails(props: TradeBasicDetailsProp) {
  const { trade, allowedSlippage, allowsOffchainSigning, fee, isReviewSwap, hideSlippage, ...boxProps } = props
  const allowedSlippagePercent = !(allowedSlippage instanceof Percent)
    ? INITIAL_ALLOWED_SLIPPAGE_PERCENT
    : allowedSlippage

  // trades are null when there is a fee quote error e.g
  // so we can take both
  const feeFiatValue = useUsdAmount(fee).value
  const partnerFeeFiatValue = useUsdAmount(trade?.partnerFeeAmount).value
  const isEoaEthFlow = useIsEoaEthFlow()
  const isWrapOrUnwrap = useIsWrapOrUnwrap()
  const { content } = useInjectedWidgetParams()

  const isExactIn = trade?.tradeType === TradeType.EXACT_INPUT

  const showRowSlippage =
    !hideSlippage &&
    (isReviewSwap || isEoaEthFlow || !allowedSlippagePercent.equalTo(INITIAL_ALLOWED_SLIPPAGE_PERCENT)) &&
    !isWrapOrUnwrap

  const showRowReceivedAfterSlippage = isReviewSwap && trade

  return (
    <LowerSectionWrapper {...boxProps}>
      {/* Fee (partnerFee) */}
      {trade && (
        <RowPartnerFee
          partnerFee={trade.partnerFee}
          feeAmount={trade.partnerFeeAmount}
          feeInFiat={partnerFeeFiatValue}
          label={content?.feeLabel || undefined}
          tooltipMarkdown={content?.feeTooltipMarkdown}
        />
      )}

      {/* Network costs */}
      <RowNetworkCosts
        trade={trade}
        allowsOffchainSigning={allowsOffchainSigning}
        feeAmount={fee}
        feeInFiat={feeFiatValue}
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
                    amount={isExactIn ? trade?.outputAmountAfterFees : trade.inputAmountAfterFees}
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
        <RowReceivedAfterSlippage trade={trade} allowedSlippage={allowedSlippagePercent} highlightAmount={isReviewSwap}>
          {isReviewSwap ? (
            <ReceiveAmountTitle>{isExactIn ? 'Minimum receive' : 'Maximum sent'}</ReceiveAmountTitle>
          ) : null}
        </RowReceivedAfterSlippage>
      )}
    </LowerSectionWrapper>
  )
}
