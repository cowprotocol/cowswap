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

  // TODO(bridge): The following props are temporary for bridge demo and will be refactored
  // when actual bridging functionality is implemented. They allow bridge information to be
  // displayed in the accordion UI.
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
    // TODO(bridge): These bridge-related props are temporary and will be replaced
    // with actual bridge data when the full bridge implementation is completed
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
      // TODO(bridge): Passing bridge props through for demo purposes
      bridgeEstimatedTime={bridgeEstimatedTime}
      bridgeProtocol={bridgeProtocol}
      showBridgeUI={showBridgeUI}
    >
      <styledEl.Box noMargin>{children}</styledEl.Box>
    </TradeDetailsAccordion>
  )
}
