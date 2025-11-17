import { ReactElement, useCallback, useState } from 'react'

import { t } from '@lingui/core/macro'

import { PartnerFeeRow, TradeTotalCostsDetails } from 'modules/trade'
import { Box } from 'modules/trade/containers/TradeTotalCostsDetails/styled'
import { useUsdAmount } from 'modules/usdAmount'
import { useVolumeFee, useVolumeFeeTooltip } from 'modules/volumeFee'

import { RateInfo, RateInfoParams } from 'common/pure/RateInfo'

import { useLimitOrderPartnerFeeAmount } from '../../hooks/useLimitOrderPartnerFeeAmount'

interface TradeRateDetailsProps {
  rateInfoParams?: RateInfoParams
  alwaysExpanded?: boolean
}

export function TradeRateDetails({ rateInfoParams, alwaysExpanded = false }: TradeRateDetailsProps): ReactElement {
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
        <RateInfo
          label={t`Limit price`}
          stylized={true}
          rateInfoParams={rateInfoParams}
          rightAlign
          fontSize={13}
          fontBold
        />
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
