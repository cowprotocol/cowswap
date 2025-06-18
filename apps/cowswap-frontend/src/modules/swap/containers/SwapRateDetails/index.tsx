import { ReactNode, useCallback } from 'react'

import { BridgeProviderInfo } from '@cowprotocol/cow-sdk'

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

interface BridgeFeeWrapperProps {
  bridgeEstimatedTime: number | undefined
  bridgeProtocol: BridgeProviderInfo
  feeElement: ReactNode
  isOpen: boolean
}

function BridgeFeeWrapper({
  bridgeEstimatedTime,
  bridgeProtocol,
  feeElement,
  isOpen,
}: BridgeFeeWrapperProps): ReactNode {
  return (
    <BridgeAccordionSummary bridgeEstimatedTime={bridgeEstimatedTime} bridgeProtocol={bridgeProtocol} isOpen={isOpen}>
      {feeElement}
    </BridgeAccordionSummary>
  )
}

export function SwapRateDetails({ rateInfoParams, deadline }: SwapRateDetailsProps): ReactNode {
  const { isLoading: isRateLoading, bridgeQuote } = useTradeQuote()

  const shouldDisplayBridgeDetails = useShouldDisplayBridgeDetails()

  const providerDetails = bridgeQuote?.providerInfo
  const bridgeEstimatedTime = bridgeQuote?.expectedFillTimeSeconds

  const swapContext = useQuoteSwapContext()
  const bridgeContext = useQuoteBridgeContext()

  const feeWrapper = useCallback(
    (feeElement: ReactNode, isOpen: boolean) => (
      <BridgeFeeWrapper
        bridgeEstimatedTime={bridgeEstimatedTime}
        bridgeProtocol={providerDetails!}
        feeElement={feeElement}
        isOpen={isOpen}
      />
    ),
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
