import React, { useState, useCallback } from 'react'

import { useInjectedWidgetParams } from 'modules/injectedWidget'
import { TradeTotalCostsDetails, PartnerFeeRow } from 'modules/trade'
import { useUsdAmount } from 'modules/usdAmount'
import { useVolumeFee } from 'modules/volumeFee'

import { RateInfoParams } from 'common/pure/RateInfo'

import { useLimitOrderPartnerFeeAmount } from '../../hooks/useLimitOrderPartnerFeeAmount'

interface TradeRateDetailsProps {
  rateInfoParams?: RateInfoParams
}

export function TradeRateDetails({ rateInfoParams }: TradeRateDetailsProps) {
  const [isFeeDetailsOpen, setFeeDetailsOpen] = useState(false)
  const widgetParams = useInjectedWidgetParams()
  const volumeFee = useVolumeFee()
  const partnerFeeAmount = useLimitOrderPartnerFeeAmount()
  const partnerFeeUsd = useUsdAmount(partnerFeeAmount).value
  const partnerFeeBps = volumeFee?.bps

  const toggleAccordion = useCallback(() => {
    setFeeDetailsOpen((prev) => !prev)
  }, [])

  const partnerFeeRow = (
    <PartnerFeeRow
      alwaysRow
      withTimelineDot={false}
      partnerFeeUsd={partnerFeeUsd}
      partnerFeeAmount={partnerFeeAmount}
      partnerFeeBps={partnerFeeBps}
      widgetContent={widgetParams.content}
    />
  )

  if (!rateInfoParams) {
    return partnerFeeRow
  }

  return (
    <TradeTotalCostsDetails
      rateInfoParams={rateInfoParams}
      totalCosts={partnerFeeAmount}
      isFeeDetailsOpen={isFeeDetailsOpen}
      toggleAccordion={toggleAccordion}
    >
      {partnerFeeRow}
    </TradeTotalCostsDetails>
  )
}
