import { ReactNode } from 'react'

import {
  BridgeAccordionSummary,
  useQuoteBridgeContext,
  useQuoteSwapContext,
  useShouldDisplayBridgeDetails,
  QuoteDetails,
} from 'modules/bridge'
import { useTradeQuote } from 'modules/tradeQuote'
import { TradeRateDetails } from 'modules/tradeWidgetAddons'

import { RateInfoParams } from 'common/pure/RateInfo'

export interface SwapRateDetailsProps {
  rateInfoParams: RateInfoParams
  deadline: number
}

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function SwapRateDetails({ rateInfoParams, deadline }: SwapRateDetailsProps) {
  const { isLoading: isRateLoading, bridgeQuote } = useTradeQuote()

  const shouldDisplayBridgeDetails = useShouldDisplayBridgeDetails()

  const providerDetails = bridgeQuote?.providerInfo
  const bridgeEstimatedTime = bridgeQuote?.expectedFillTimeSeconds

  const swapContext = useQuoteSwapContext()
  const bridgeContext = useQuoteBridgeContext()

  return (
    <TradeRateDetails
      isTradePriceUpdating={isRateLoading}
      rateInfoParams={rateInfoParams}
      deadline={deadline}
      accordionContent={
        shouldDisplayBridgeDetails &&
        providerDetails &&
        swapContext &&
        bridgeContext && (
          <>
            <QuoteDetails bridgeProvider={providerDetails} swapContext={swapContext} bridgeContext={bridgeContext} />
          </>
        )
      }
      feeWrapper={
        shouldDisplayBridgeDetails && providerDetails
          // TODO: Extract nested component outside render function
          // eslint-disable-next-line react/no-unstable-nested-components
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
