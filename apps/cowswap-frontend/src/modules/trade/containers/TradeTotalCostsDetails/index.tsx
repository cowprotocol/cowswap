import { ReactNode } from 'react'

import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

import { useUsdAmount } from 'modules/usdAmount'

import { RateInfoParams } from 'common/pure/RateInfo'
import { TradeDetailsAccordion } from 'common/pure/TradeDetailsAccordion'

import * as styledEl from './styled'

export interface TradeRatesProps {
  rateInfoParams: RateInfoParams
  totalCosts: CurrencyAmount<Currency> | null
  isFeeDetailsOpen: boolean
  toggleAccordion: () => void
  children?: ReactNode
  feeWrapper?: (defaultFeeContent: React.ReactNode) => React.ReactNode
}

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function TradeTotalCostsDetails(props: TradeRatesProps) {
  const { rateInfoParams, totalCosts, isFeeDetailsOpen, toggleAccordion, children, feeWrapper } = props
  const totalCostsUsd = useUsdAmount(totalCosts).value

  if (!totalCosts) {
    return null
  }

  return (
    <TradeDetailsAccordion
      rateInfo={<styledEl.StyledRateInfo noLabel={true} stylized={true} rateInfoParams={rateInfoParams} />}
      feeUsdTotalAmount={totalCostsUsd}
      feeTotalAmount={totalCosts}
      open={isFeeDetailsOpen}
      onToggle={toggleAccordion}
      feeWrapper={feeWrapper}
    >
      <styledEl.Box noMargin>{children}</styledEl.Box>
    </TradeDetailsAccordion>
  )
}
