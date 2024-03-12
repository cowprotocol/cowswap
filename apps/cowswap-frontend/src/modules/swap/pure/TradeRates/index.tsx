import React from 'react'

import { genericPropsChecker } from '@cowprotocol/common-utils'
import { FiatAmount, TokenAmount } from '@cowprotocol/ui'
import { Currency, CurrencyAmount, Percent } from '@uniswap/sdk-core'

import TradeGp from 'legacy/state/swap/TradeGp'

import { RowDeadline } from 'modules/swap/containers/Row/RowDeadline'
import { TradeBasicDetails } from 'modules/swap/containers/TradeBasicDetails'

import { RateInfoParams } from 'common/pure/RateInfo'
import { TradeDetailsAccordion } from 'common/pure/TradeDetailsAccordion'

import * as styledEl from './styled'
import { useFeeAmounts } from './useFeeAmounts'

// const SUBSIDY_INFO_MESSAGE_EXTENDED =
//   SUBSIDY_INFO_MESSAGE + '. Click on the discount button on the right for more info.'

export interface TradeRatesProps {
  trade: TradeGp | undefined
  allowedSlippage: Percent
  allowsOffchainSigning: boolean
  userAllowedSlippage: Percent | string
  isFeeGreater: boolean
  discount: number
  fee: CurrencyAmount<Currency> | null
  rateInfoParams: RateInfoParams
  priceLabel?: string
  isReviewSwap?: boolean
  children?: JSX.Element
}

export const TradeRates = React.memo(function (props: TradeRatesProps) {
  const {
    isFeeGreater,
    fee,
    trade,
    allowsOffchainSigning,
    userAllowedSlippage,
    // discount,
    rateInfoParams,
    isReviewSwap = false,
    children,
  } = props
  // const openCowSubsidyModal = useOpenModal(ApplicationModal.COW_SUBSIDY)

  const showPrice = !!trade
  const showTradeBasicDetails = (isFeeGreater || trade) && fee
  const showRowDeadline = !!trade

  const { feeTotalAmount, feeUsdTotalAmount } = useFeeAmounts(trade, fee)

  if (!feeTotalAmount && !feeUsdTotalAmount) return null

  const feeSummary =
    feeUsdTotalAmount && feeUsdTotalAmount.greaterThan(0) ? (
      <FiatAmount amount={feeUsdTotalAmount} />
    ) : (
      <TokenAmount amount={feeTotalAmount} tokenSymbol={feeTotalAmount?.currency} />
    )

  const tradeBasicDetails = fee && (
    <TradeBasicDetails
      allowedSlippage={userAllowedSlippage}
      allowsOffchainSigning={allowsOffchainSigning}
      trade={trade}
      fee={fee}
      isReviewSwap={isReviewSwap}
      hideSlippage={isFeeGreater}
    />
  )

  if (showPrice) {
    return (
      <TradeDetailsAccordion
        open={isReviewSwap}
        rateInfo={<styledEl.StyledRateInfo noLabel={true} stylized={true} rateInfoParams={rateInfoParams} />}
        feeSummary={showTradeBasicDetails && feeSummary}
      >
        <styledEl.Box noMargin>
          {showTradeBasicDetails && tradeBasicDetails}
          {showRowDeadline && <RowDeadline />}
          {children}
        </styledEl.Box>
      </TradeDetailsAccordion>
    )
  } else if (fee && isFeeGreater) {
    return <styledEl.FeeWrapper>{tradeBasicDetails}</styledEl.FeeWrapper>
  }

  return null
}, genericPropsChecker)
