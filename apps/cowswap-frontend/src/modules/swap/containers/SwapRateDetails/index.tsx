import { ReactNode, useCallback } from 'react'

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

export function SwapRateDetails({ rateInfoParams, deadline }: SwapRateDetailsProps): ReactNode {
  const { isLoading: isRateLoading, bridgeQuote } = useTradeQuote()

  const shouldDisplayBridgeDetails = useShouldDisplayBridgeDetails()

  const providerDetails = bridgeQuote?.providerInfo
  const bridgeEstimatedTime = bridgeQuote?.expectedFillTimeSeconds

  const swapContext = useQuoteSwapContext()
  const bridgeContext = useQuoteBridgeContext()

  const feeWrapper = useCallback(
    (feeElement: ReactNode, isOpen: boolean) => {
      if (!providerDetails) return feeElement

      return (
        <BridgeAccordionSummary
          bridgeEstimatedTime={bridgeEstimatedTime}
          bridgeProtocol={providerDetails}
          isOpen={isOpen}
        >
          {feeElement}
        </BridgeAccordionSummary>
      )
    },
    [bridgeEstimatedTime, providerDetails],
  )

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
      feeWrapper={shouldDisplayBridgeDetails && providerDetails ? feeWrapper : undefined}
    />
  )
}
