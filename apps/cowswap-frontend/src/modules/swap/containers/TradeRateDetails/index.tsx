import React from 'react'

import { useInjectedWidgetParams } from 'modules/injectedWidget'
import { getTotalCosts, ReceiveAmountInfo, TradeFeesAndCosts, TradeTotalCostsDetails } from 'modules/trade'

import { RateInfoParams } from 'common/pure/RateInfo'

import { RowDeadline } from '../Row/RowDeadline'

interface TradeRateDetailsProps {
  receiveAmountInfo: ReceiveAmountInfo | null
  rateInfoParams: RateInfoParams
}

export function TradeRateDetails({ receiveAmountInfo, rateInfoParams }: TradeRateDetailsProps) {
  const widgetParams = useInjectedWidgetParams()

  const totalCosts = receiveAmountInfo && getTotalCosts(receiveAmountInfo)

  return (
    <TradeTotalCostsDetails totalCosts={totalCosts} rateInfoParams={rateInfoParams}>
      <>
        <TradeFeesAndCosts receiveAmountInfo={receiveAmountInfo} widgetParams={widgetParams} withTimelineDot={false} />
        <RowDeadline />
      </>
    </TradeTotalCostsDetails>
  )
}
