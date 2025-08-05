import { ReactNode } from 'react'

import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

import { useUsdAmount } from 'modules/usdAmount'

import { RateInfoParams, RateInfo } from 'common/pure/RateInfo'
import { TradeDetailsAccordion } from 'common/pure/TradeDetailsAccordion'

import * as styledEl from './styled'

export interface TradeRatesProps {
  rateInfoParams: RateInfoParams
  totalCosts: CurrencyAmount<Currency> | null
  isFeeDetailsOpen: boolean
  toggleAccordion: () => void
  children?: ReactNode
  feeWrapper?: (defaultFeeContent: React.ReactNode, isOpen: boolean) => ReactNode
}

export function TradeTotalCostsDetails(props: TradeRatesProps): ReactNode {
  const { rateInfoParams, totalCosts, isFeeDetailsOpen, toggleAccordion, children, feeWrapper } = props
  const totalCostsUsd = useUsdAmount(totalCosts).value

  if (!totalCosts) {
    return null
  }

  return (
    <TradeDetailsAccordion
      rateInfo={<RateInfo noLabel={true} stylized={true} rateInfoParams={rateInfoParams} fontSize={13} fontBold />}
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
