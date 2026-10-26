import { ReactElement, useCallback, useState } from 'react'

import { t } from '@lingui/core/macro'

import { AffiliateTraderRewardsRow, useIsRewardsRowEnabled } from 'modules/affiliate'
import { TradeFees, TradeTotalCostsDetails, TxCostRow, useSolanaTxCost } from 'modules/trade'
import { useTradeQuoteProtocolFee } from 'modules/tradeQuote'
import { useUsdAmount } from 'modules/usdAmount'
import { useVolumeFee, useVolumeFeeTooltip } from 'modules/volumeFee'

import { RateInfo, RateInfoParams } from 'common/pure/RateInfo'

import { useLimitOrderPartnerFeeAmount } from '../../hooks/useLimitOrderPartnerFeeAmount'
import { useLimitOrderProtocolFeeAmount } from '../../hooks/useLimitOrderProtocolFeeAmount'

interface TradeRateDetailsProps {
  rateInfoParams?: RateInfoParams
  alwaysExpanded?: boolean
  loading?: boolean
}

export function TradeRateDetails({
  rateInfoParams,
  alwaysExpanded = false,
  loading = false,
}: TradeRateDetailsProps): ReactElement {
  const [isFeeDetailsOpen, setFeeDetailsOpen] = useState(alwaysExpanded)
  const { volumeBps: partnerFeeBps } = useVolumeFee() || {}
  const isRewardsRowEnabled = useIsRewardsRowEnabled()
  const partnerFeeAmount = useLimitOrderPartnerFeeAmount()
  const protocolFeeAmount = useLimitOrderProtocolFeeAmount()
  const volumeFeeTooltip = useVolumeFeeTooltip()
  const partnerFeeUsd = useUsdAmount(partnerFeeAmount).value
  const protocolFeeUsd = useUsdAmount(protocolFeeAmount).value

  const protocolFeeBps = useTradeQuoteProtocolFee()
  const detailRowStyle = !!rateInfoParams
  const solanaTxCost = useSolanaTxCost()
  const solanaTxCostUsd = useUsdAmount(solanaTxCost?.amount).value

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
      loading={loading}
      detailRowStyle={detailRowStyle}
    />
  )

  // Paid from the wallet rather than taken out of the trade, so it stays out of the costs accordion.
  const txCostRow = solanaTxCost && (
    <TxCostRow
      txCost={solanaTxCost.amount}
      txCostUsd={solanaTxCostUsd}
      isSponsored={solanaTxCost.isSponsored}
      detailRowStyle={detailRowStyle}
    />
  )

  if (!rateInfoParams) {
    return (
      <>
        {tradeFees}
        {isRewardsRowEnabled && <AffiliateTraderRewardsRow />}
        {txCostRow}
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
          mutedValue
        />
        {tradeFees}
        {isRewardsRowEnabled && <AffiliateTraderRewardsRow />}
        {txCostRow}
      </>
    )
  }

  return (
    <>
      <TradeTotalCostsDetails
        rateInfoParams={rateInfoParams}
        totalCosts={partnerFeeAmount}
        isFeeDetailsOpen={isFeeDetailsOpen}
        toggleAccordion={toggleAccordion}
      >
        {tradeFees}
        {isRewardsRowEnabled && <AffiliateTraderRewardsRow />}
      </TradeTotalCostsDetails>
      {txCostRow}
    </>
  )
}
