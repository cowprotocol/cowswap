import React from 'react'

import { genericPropsChecker } from '@cowprotocol/common-utils'
import { useWalletDetails } from '@cowprotocol/wallet'
import { Currency, CurrencyAmount, Percent } from '@uniswap/sdk-core'

import TradeGp from 'legacy/state/swap/TradeGp'

import { RowDeadline } from 'modules/swap/containers/Row/RowDeadline'
import { TradeBasicDetails } from 'modules/swap/containers/TradeBasicDetails'

import { RateInfoParams } from 'common/pure/RateInfo'
import { TradeDetailsAccordion } from 'common/pure/TradeDetailsAccordion'

import * as styledEl from './styled'
import { useFeeAmounts } from './useFeeAmounts'

export interface TradeRatesProps {
  trade: TradeGp | undefined
  allowedSlippage: Percent
  userAllowedSlippage: Percent | string
  isFeeGreater: boolean
  fee: CurrencyAmount<Currency> | null
  rateInfoParams: RateInfoParams
  isReviewSwap?: boolean
  children?: JSX.Element
}

export const TradeRates = React.memo(function (props: TradeRatesProps) {
  const { isFeeGreater, fee, trade, userAllowedSlippage, rateInfoParams, isReviewSwap = false, children } = props

  const showPrice = !!trade
  const showTradeBasicDetails = (isFeeGreater || trade) && fee

  const { allowsOffchainSigning } = useWalletDetails()
  const { feeTotalAmount, feeUsdTotalAmount } = useFeeAmounts(trade, fee)

  if (!feeTotalAmount && !feeUsdTotalAmount) return null

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
        feeUsdTotalAmount={feeUsdTotalAmount}
        feeTotalAmount={feeTotalAmount}
      >
        <styledEl.Box noMargin>
          {showTradeBasicDetails && tradeBasicDetails}
          <RowDeadline />
          {children}
        </styledEl.Box>
      </TradeDetailsAccordion>
    )
  } else if (fee && isFeeGreater) {
    return <styledEl.FeeWrapper>{tradeBasicDetails}</styledEl.FeeWrapper>
  }

  return null
}, genericPropsChecker)
