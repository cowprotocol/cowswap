import React, { useState, useCallback } from 'react'

import { TradeTotalCostsDetails, PartnerFeeRow } from 'modules/trade'
import { StyledRateInfo } from 'modules/trade/containers/TradeTotalCostsDetails/styled'
import { Box } from 'modules/trade/containers/TradeTotalCostsDetails/styled'
import { useUsdAmount } from 'modules/usdAmount'
import { useVolumeFee, useVolumeFeeTooltip } from 'modules/volumeFee'

import { RateInfoParams } from 'common/pure/RateInfo'

import { useLimitOrderPartnerFeeAmount } from '../../hooks/useLimitOrderPartnerFeeAmount'

interface TradeRateDetailsProps {
  rateInfoParams?: RateInfoParams
  alwaysExpanded?: boolean
}

export function TradeRateDetails({ rateInfoParams, alwaysExpanded = false }: TradeRateDetailsProps) {
  const [isFeeDetailsOpen, setFeeDetailsOpen] = useState(alwaysExpanded)
  const volumeFee = useVolumeFee()
  const partnerFeeAmount = useLimitOrderPartnerFeeAmount()
  const volumeFeeTooltip = useVolumeFeeTooltip()
  const partnerFeeUsd = useUsdAmount(partnerFeeAmount).value
  const partnerFeeBps = volumeFee?.bps

  const toggleAccordion = useCallback(() => {
    if (alwaysExpanded) return
    setFeeDetailsOpen((prev) => !prev)
  }, [alwaysExpanded])

  const partnerFeeRow = (
    <PartnerFeeRow
      withTimelineDot={false}
      partnerFeeUsd={partnerFeeUsd}
      partnerFeeAmount={partnerFeeAmount}
      partnerFeeBps={partnerFeeBps}
      volumeFeeTooltip={volumeFeeTooltip}
    />
  )

  if (!rateInfoParams) {
    return partnerFeeRow
  }

  if (alwaysExpanded) {
    return (
      <>
        <StyledRateInfo label="Limit price" stylized={true} rateInfoParams={rateInfoParams} rightAlign />
        <Box noMargin>{partnerFeeRow}</Box>
      </>
    )
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
