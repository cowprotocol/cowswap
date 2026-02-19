import { ReactElement, useCallback, useState } from 'react'

import { t } from '@lingui/core/macro'

import { AffiliateTraderRewardsRow } from 'modules/affiliate/containers/AffiliateTraderRewardsRow'
import { TradeFees, TradeTotalCostsDetails } from 'modules/trade'
import { Box } from 'modules/trade/containers/TradeTotalCostsDetails/styled'
import { useTradeQuote, useTradeQuoteProtocolFee } from 'modules/tradeQuote'
import { useUsdAmount } from 'modules/usdAmount'
import { useVolumeFee, useVolumeFeeTooltip } from 'modules/volumeFee'

import { RateInfo, RateInfoParams } from 'common/pure/RateInfo'

import { useLimitOrderPartnerFeeAmount } from '../../hooks/useLimitOrderPartnerFeeAmount'
import { useLimitOrderProtocolFeeAmount } from '../../hooks/useLimitOrderProtocolFeeAmount'

interface TradeRateDetailsProps {
  rateInfoParams?: RateInfoParams
  alwaysExpanded?: boolean
}

export function TradeRateDetails({ rateInfoParams, alwaysExpanded = false }: TradeRateDetailsProps): ReactElement {
  const [isFeeDetailsOpen, setFeeDetailsOpen] = useState(alwaysExpanded)
  const { volumeBps: partnerFeeBps } = useVolumeFee() || {}
  const partnerFeeAmount = useLimitOrderPartnerFeeAmount()
  const protocolFeeAmount = useLimitOrderProtocolFeeAmount()
  const volumeFeeTooltip = useVolumeFeeTooltip()
  const partnerFeeUsd = useUsdAmount(partnerFeeAmount).value
  const protocolFeeUsd = useUsdAmount(protocolFeeAmount).value

  const { isLoading } = useTradeQuote()
  const protocolFeeBps = useTradeQuoteProtocolFee()

  const toggleAccordion = useCallback(() => {
    if (alwaysExpanded) return
    setFeeDetailsOpen((prev) => !prev)
  }, [alwaysExpanded])

  const tradeFees = (
    <TradeFees
      partnerFeeAmount={partnerFeeAmount}
      partnerFeeUsd={partnerFeeUsd}
      partnerFeeBps={partnerFeeBps}
      protocolFeeAmount={protocolFeeAmount}
      protocolFeeUsd={protocolFeeUsd}
      protocolFeeBps={protocolFeeBps}
      withTimelineDot={false}
      volumeFeeTooltip={volumeFeeTooltip}
      loading={isLoading}
    />
  )

  if (!rateInfoParams) {
    return (
      <>
        {tradeFees}
        <AffiliateTraderRewardsRow />
      </>
    )
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
        <Box noMargin>
          {tradeFees}
          <AffiliateTraderRewardsRow />
        </Box>
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
      {tradeFees}
      <AffiliateTraderRewardsRow />
    </TradeTotalCostsDetails>
  )
}
