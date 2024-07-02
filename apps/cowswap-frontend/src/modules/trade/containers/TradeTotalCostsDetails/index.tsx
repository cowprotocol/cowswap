import { ReactNode } from 'react'

import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

import { useUsdAmount } from 'modules/usdAmount'

import { RateInfoParams } from 'common/pure/RateInfo'
import { TradeDetailsAccordion } from 'common/pure/TradeDetailsAccordion'

import * as styledEl from './styled'

export interface TradeRatesProps {
  rateInfoParams: RateInfoParams
  totalCosts: CurrencyAmount<Currency> | null
  children?: ReactNode
}

export function TradeTotalCostsDetails(props: TradeRatesProps) {
  const { rateInfoParams, totalCosts, children } = props

  const totalCostsUsd = useUsdAmount(totalCosts).value

  if (!totalCosts || !totalCostsUsd) return null

  return (
    <TradeDetailsAccordion
      rateInfo={<styledEl.StyledRateInfo noLabel={true} stylized={true} rateInfoParams={rateInfoParams} />}
      feeUsdTotalAmount={totalCostsUsd}
      feeTotalAmount={totalCosts}
    >
      <styledEl.Box noMargin>{children}</styledEl.Box>
    </TradeDetailsAccordion>
  )
}
