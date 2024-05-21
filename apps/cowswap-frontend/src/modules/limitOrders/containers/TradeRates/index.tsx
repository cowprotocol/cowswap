import React from 'react'

import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

import styled from 'styled-components/macro'
import { Nullish } from 'types'

import { useInjectedWidgetParams, useWidgetPartnerFee } from 'modules/injectedWidget'
import { ReceiveAmountInfo, RowPartnerFee } from 'modules/trade'
import { useUsdAmount } from 'modules/usdAmount'

import { useRateInfoParams } from 'common/hooks/useRateInfoParams'
import { RateInfo } from 'common/pure/RateInfo'
import { TradeDetailsAccordion } from 'common/pure/TradeDetailsAccordion'

import { useLimitOrdersDerivedState } from '../../hooks/useLimitOrdersDerivedState'

const StyledRateInfo = styled(RateInfo)`
  min-height: 24px;
`

const preferAmountAfterFees = (
  amountAfterFees: Nullish<CurrencyAmount<Currency>>,
  amount: Nullish<CurrencyAmount<Currency>>
) => (amountAfterFees?.currency === amount?.currency ? amountAfterFees : amount)

export interface TradeRatesProps {
  receiveAmountInfo: ReceiveAmountInfo | null
}

export function TradeRates({ receiveAmountInfo }: TradeRatesProps) {
  const partnerFeeAmount = receiveAmountInfo?.partnerFeeAmount || null
  const amountAfterFees = receiveAmountInfo?.amountAfterFees || null

  const { inputCurrencyAmount, outputCurrencyAmount } = useLimitOrdersDerivedState()

  /**
   * Calculate rate info taking into account fees
   */
  const rateInfoParams = useRateInfoParams(
    preferAmountAfterFees(amountAfterFees, inputCurrencyAmount),
    preferAmountAfterFees(amountAfterFees, outputCurrencyAmount)
  )
  const partnerFee = useWidgetPartnerFee()
  const partnerFeeFiatValue = useUsdAmount(partnerFeeAmount).value
  const { content } = useInjectedWidgetParams()

  const rateInfo = <StyledRateInfo rateInfoParams={rateInfoParams} noLabel={true} />

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
