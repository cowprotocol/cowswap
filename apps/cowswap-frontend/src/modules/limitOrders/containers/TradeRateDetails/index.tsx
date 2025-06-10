import { useCallback, useState } from 'react'

import { PartnerFeeRow, TradeTotalCostsDetails } from 'modules/trade'
import { Box, StyledRateInfo } from 'modules/trade/containers/TradeTotalCostsDetails/styled'
import { useUsdAmount } from 'modules/usdAmount'
import { useVolumeFee, useVolumeFeeTooltip } from 'modules/volumeFee'

import { RateInfoParams } from 'common/pure/RateInfo'

import { useLimitOrderPartnerFeeAmount } from '../../hooks/useLimitOrderPartnerFeeAmount'

interface TradeRateDetailsProps {
  rateInfoParams?: RateInfoParams
  alwaysExpanded?: boolean
}

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function TradeRateDetails({ rateInfoParams, alwaysExpanded = false }: TradeRateDetailsProps) {
  const [isFeeDetailsOpen, setFeeDetailsOpen] = useState(alwaysExpanded)
  const { volumeBps: partnerFeeBps } = useVolumeFee() || {}
  const partnerFeeAmount = useLimitOrderPartnerFeeAmount()
  const volumeFeeTooltip = useVolumeFeeTooltip()
  const partnerFeeUsd = useUsdAmount(partnerFeeAmount).value

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
