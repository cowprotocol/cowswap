import { ReactNode } from 'react'

import { BridgeAccordionSummary, BridgeRouteBreakdown, useShouldDisplayBridgeDetails } from 'modules/bridge'
import { useReceiveAmountInfo } from 'modules/trade'
import { useTradeQuote } from 'modules/tradeQuote'
import { TradeRateDetails } from 'modules/tradeWidgetAddons'

import { RateInfoParams } from 'common/pure/RateInfo'

export interface SwapRateDetailsProps {
  rateInfoParams: RateInfoParams
  deadline: number
}

export function SwapRateDetails({ rateInfoParams, deadline }: SwapRateDetailsProps) {
  const { isLoading: isRateLoading, bridgeQuote } = useTradeQuote()

  const receiveAmountInfo = useReceiveAmountInfo()

  const shouldDisplayBridgeDetails = useShouldDisplayBridgeDetails()

  const providerDetails = bridgeQuote?.providerInfo
  const bridgeEstimatedTime = bridgeQuote?.expectedFillTimeSeconds

  return (
    <TradeRateDetails
      isTradePriceUpdating={isRateLoading}
      rateInfoParams={rateInfoParams}
      deadline={deadline}
      accordionContent={
        shouldDisplayBridgeDetails &&
        receiveAmountInfo &&
        bridgeQuote && <BridgeRouteBreakdown receiveAmountInfo={receiveAmountInfo} bridgeQuote={bridgeQuote} />
      }
      feeWrapper={
        shouldDisplayBridgeDetails && providerDetails
          ? (feeElement: ReactNode) => (
              <BridgeAccordionSummary bridgeEstimatedTime={bridgeEstimatedTime} bridgeProtocol={providerDetails}>
                {feeElement}
              </BridgeAccordionSummary>
            )
          : undefined
      }
    />
  )
}
