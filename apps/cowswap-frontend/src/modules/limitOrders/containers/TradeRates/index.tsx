import React from 'react'

import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

import styled from 'styled-components/macro'

import { useInjectedWidgetParams, useWidgetPartnerFee } from 'modules/injectedWidget'
import { RowPartnerFee } from 'modules/trade'
import { useUsdAmount } from 'modules/usdAmount'

import { RateInfo, RateInfoParams } from 'common/pure/RateInfo'
import { TradeDetailsAccordion } from 'common/pure/TradeDetailsAccordion'

const StyledRateInfo = styled(RateInfo)`
  min-height: 24px;
`

export interface TradeRatesProps {
  rateInfoParams: RateInfoParams
  partnerFeeAmount: CurrencyAmount<Currency> | null
}

export function TradeRates({ partnerFeeAmount, rateInfoParams }: TradeRatesProps) {
  const partnerFee = useWidgetPartnerFee()
  const partnerFeeFiatValue = useUsdAmount(partnerFeeAmount).value
  const { content } = useInjectedWidgetParams()

  // TODO: substract partner fee from rateInfoParams
  const rateInfo = <StyledRateInfo rateInfoParams={rateInfoParams} />

  return (
    <TradeDetailsAccordion
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
    </TradeDetailsAccordion>
  )
}
