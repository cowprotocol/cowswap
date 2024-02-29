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

  return (
    <TradeDetailsAccordion
      open={isReviewSwap}
      rateInfo={showPrice && <styledEl.StyledRateInfo noLabel={true} stylized={true} rateInfoParams={rateInfoParams} />}
      feeSummary={showTradeBasicDetails && feeSummary}
    >
      <styledEl.Box>
        {showTradeBasicDetails && (
          <TradeBasicDetails
            allowedSlippage={userAllowedSlippage}
            allowsOffchainSigning={allowsOffchainSigning}
            trade={trade}
            fee={fee}
            isReviewSwap={isReviewSwap}
          />
        )}
        {showRowDeadline && <RowDeadline />}
        {children}
      </styledEl.Box>
    </TradeDetailsAccordion>
  )
}, genericPropsChecker)
