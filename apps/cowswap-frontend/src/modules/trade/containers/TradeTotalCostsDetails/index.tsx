import { ReactNode } from 'react'

import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

import { BridgeProtocolConfig } from 'modules/bridge'
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

  // Optional props for displaying bridge info in the accordion summary
  bridgeEstimatedTime?: number
  bridgeProtocol?: BridgeProtocolConfig
  showBridgeUI?: boolean
}

export function TradeTotalCostsDetails(props: TradeRatesProps) {
  const {
    rateInfoParams,
    totalCosts,
    isFeeDetailsOpen,
    toggleAccordion,
    children,
    bridgeEstimatedTime,
    bridgeProtocol,
    showBridgeUI,
  } = props
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
      bridgeEstimatedTime={bridgeEstimatedTime}
      bridgeProtocol={bridgeProtocol}
      showBridgeUI={showBridgeUI}
    >
      <styledEl.Box noMargin>{children}</styledEl.Box>
    </TradeDetailsAccordion>
  )
}
