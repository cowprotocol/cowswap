import React from 'react'

import { genericPropsChecker } from '@cowprotocol/common-utils'
import { Currency, CurrencyAmount, Percent } from '@uniswap/sdk-core'

import TradeGp from 'legacy/state/swap/TradeGp'

import { RowDeadline } from 'modules/swap/containers/Row/RowDeadline'
import { TradeBasicDetails } from 'modules/swap/containers/TradeBasicDetails'

import { RateInfoParams } from 'common/pure/RateInfo'
import { TradeDetailsAccordion } from 'common/pure/TradeDetailsAccordion'

import * as styledEl from './styled'

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
    priceLabel = 'Rate',
    isReviewSwap = false,
    children,
  } = props
  // const openCowSubsidyModal = useOpenModal(ApplicationModal.COW_SUBSIDY)

  const showPrice = !!trade
  const showTradeBasicDetails = (isFeeGreater || trade) && fee
  const showRowDeadline = !!trade

  if (!trade?.inputAmount && !trade?.outputAmount) return null

  return (
    <TradeDetailsAccordion
      rateInfo={showPrice && <styledEl.StyledRateInfo noLabel={true} stylized={true} rateInfoParams={rateInfoParams} />}
      feeSummary={
        showTradeBasicDetails && (
          <TradeBasicDetails
            allowedSlippage={userAllowedSlippage}
            allowsOffchainSigning={allowsOffchainSigning}
            trade={trade}
            fee={fee}
            fiatFeeOnly={true}
          />
        )
      }
    >
      <styledEl.Box>
        {showPrice && <styledEl.StyledRateInfo label={priceLabel} stylized={true} rateInfoParams={rateInfoParams} />}

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
