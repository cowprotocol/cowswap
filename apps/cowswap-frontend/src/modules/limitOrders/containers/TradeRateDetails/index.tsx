import React from 'react'

import { useInjectedWidgetParams, useWidgetPartnerFee } from 'modules/injectedWidget'
import { TradeTotalCostsDetails, PartnerFeeRow } from 'modules/trade'
import { useUsdAmount } from 'modules/usdAmount'

import { RateInfoParams } from 'common/pure/RateInfo'

import { useLimitOrderPartnerFeeAmount } from '../../hooks/useLimitOrderPartnerFeeAmount'

interface TradeRateDetailsProps {
  rateInfoParams?: RateInfoParams
}
export function TradeRateDetails({ rateInfoParams }: TradeRateDetailsProps) {
  const widgetParams = useInjectedWidgetParams()
  const partnerFee = useWidgetPartnerFee()
  const partnerFeeAmount = useLimitOrderPartnerFeeAmount()
  const partnerFeeUsd = useUsdAmount(partnerFeeAmount).value
  const partnerFeeBps = partnerFee?.bps

  const partnerFeeRow = (
    <PartnerFeeRow
      alwaysRow
      withTimelineDot={false}
      partnerFeeUsd={partnerFeeUsd}
      partnerFeeAmount={partnerFeeAmount}
      partnerFeeBps={partnerFeeBps}
      feeTooltipMarkdown={widgetParams.content?.feeTooltipMarkdown}
    />
  )

  if (!rateInfoParams) {
    return partnerFeeRow
  }

  return (
    <TradeTotalCostsDetails rateInfoParams={rateInfoParams} totalCosts={partnerFeeAmount}>
      {partnerFeeRow}
    </TradeTotalCostsDetails>
  )
}
