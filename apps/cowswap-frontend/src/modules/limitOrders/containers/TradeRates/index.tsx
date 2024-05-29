import React, { ReactNode } from 'react'

import styled from 'styled-components/macro'

import { useInjectedWidgetParams, useWidgetPartnerFee } from 'modules/injectedWidget'
import { ReceiveAmountInfo, RowPartnerFee } from 'modules/trade'
import { useUsdAmount } from 'modules/usdAmount'

import { RateInfo } from 'common/pure/RateInfo'
import { TradeDetailsAccordion } from 'common/pure/TradeDetailsAccordion'

import { useLimitOrdersDerivedState } from '../../hooks/useLimitOrdersDerivedState'
import { useRateInfoAfterFees } from '../../hooks/useRateInfoAfterFees'

const StyledRateInfo = styled(RateInfo)`
  min-height: 24px;
`

export interface TradeRatesProps {
  open?: boolean
  receiveAmountInfo: ReceiveAmountInfo | null
  children?: ReactNode
}

export function TradeRates({ open, receiveAmountInfo, children }: TradeRatesProps) {
  const partnerFeeAmount = receiveAmountInfo?.costs.partnerFee.amount || null

  const { inputCurrencyAmount, outputCurrencyAmount } = useLimitOrdersDerivedState()

  /**
   * Calculate rate info taking into account fees
   */
  const rateInfoParams = useRateInfoAfterFees(receiveAmountInfo, inputCurrencyAmount, outputCurrencyAmount)
  const partnerFee = useWidgetPartnerFee()
  const { content } = useInjectedWidgetParams()
  const partnerFeeFiatValue = useUsdAmount(partnerFeeAmount).value

  const rateInfo = <StyledRateInfo rateInfoParams={rateInfoParams} noLabel={true} />

  return (
    <TradeDetailsAccordion
      open={open}
      feeTotalAmount={partnerFeeAmount}
      feeUsdTotalAmount={partnerFeeFiatValue}
      rateInfo={rateInfo}
    >
      <RowPartnerFee
        partnerFee={partnerFee}
        feeAmount={partnerFeeAmount}
        feeInFiat={partnerFeeFiatValue}
        label={content?.feeLabel || undefined}
        tooltipMarkdown={content?.feeTooltipMarkdown}
      />
      {children}
    </TradeDetailsAccordion>
  )
}
