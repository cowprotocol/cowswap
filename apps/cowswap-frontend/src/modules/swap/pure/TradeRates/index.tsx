import React from 'react'

import { genericPropsChecker } from '@cowprotocol/common-utils'
import { CowSwapWidgetAppParams } from '@cowprotocol/widget-lib'
import { Currency, CurrencyAmount, Percent } from '@uniswap/sdk-core'

import TradeGp from 'legacy/state/swap/TradeGp'

import { RowDeadline } from 'modules/swap/containers/Row/RowDeadline'
import { ReceiveAmountInfo, TradeFeesAndCosts } from 'modules/trade'

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
  receiveAmountInfo: ReceiveAmountInfo | null
  widgetParams: Partial<CowSwapWidgetAppParams>
  children?: JSX.Element
}

export const TradeRates = React.memo(function (props: TradeRatesProps) {
  const { isFeeGreater, fee, trade, receiveAmountInfo, widgetParams, rateInfoParams, children } = props

  const showPrice = !!trade
  const showTradeBasicDetails = (isFeeGreater || trade) && fee

  const { feeTotalAmount, feeUsdTotalAmount } = useFeeAmounts(trade, fee)

  if (!feeTotalAmount && !feeUsdTotalAmount) return null

  const tradeBasicDetails = receiveAmountInfo && (
    <TradeFeesAndCosts receiveAmountInfo={receiveAmountInfo} widgetParams={widgetParams} withTimelineDot={false} />
  )

  if (showPrice) {
    return (
      <TradeDetailsAccordion
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
