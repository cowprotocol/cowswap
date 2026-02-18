import { ReactNode, useCallback } from 'react'

import styled from 'styled-components/macro'

import {
  BridgeAccordionSummary,
  useQuoteBridgeContext,
  useQuoteSwapContext,
  useShouldDisplayBridgeDetails,
  QuoteDetails,
} from 'modules/bridge'
import { useTradeQuote } from 'modules/tradeQuote'
import { QuoteVerificationIcon, TradeRateDetails } from 'modules/tradeWidgetAddons'

import { RateInfoParams } from 'common/pure/RateInfo'

export interface SwapRateDetailsProps {
  rateInfoParams: RateInfoParams
  deadline: number
}

const FeeSummaryWithVerification = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 6px;

  > div {
    display: inline-flex;
    align-items: center;
    line-height: 0;
  }
`

export function SwapRateDetails({ rateInfoParams, deadline }: SwapRateDetailsProps): ReactNode {
  const { isLoading: isRateLoading, bridgeQuote, quote, error: quoteError } = useTradeQuote()

  const shouldDisplayBridgeDetails = useShouldDisplayBridgeDetails()

  const providerDetails = bridgeQuote?.providerInfo
  const bridgeEstimatedTime = bridgeQuote?.expectedFillTimeSeconds
  const quoteResponse = quoteError ? undefined : quote?.quoteResults.quoteResponse
  const quoteId = quoteResponse?.id
  const quoteVerified = quoteResponse?.verified
  const quoteExpiration = quoteResponse?.expiration
  const showQuoteVerificationIcon = !!quoteResponse && !quoteError

  const swapContext = useQuoteSwapContext()
  const bridgeContext = useQuoteBridgeContext()

  const feeWrapper = useCallback(
    (feeElement: ReactNode, isOpen: boolean) => {
      const feeWithVerificationIcon = showQuoteVerificationIcon ? (
        <FeeSummaryWithVerification>
          {feeElement}
          <QuoteVerificationIcon isVerified={quoteVerified} />
        </FeeSummaryWithVerification>
      ) : (
        feeElement
      )

      if (!providerDetails) return feeWithVerificationIcon

      return (
        <BridgeAccordionSummary
          bridgeEstimatedTime={bridgeEstimatedTime}
          bridgeProtocol={providerDetails}
          isOpen={isOpen}
        >
          {feeWithVerificationIcon}
        </BridgeAccordionSummary>
      )
    },
    [bridgeEstimatedTime, providerDetails, quoteVerified, showQuoteVerificationIcon],
  )

  return (
    <TradeRateDetails
      isTradePriceUpdating={isRateLoading}
      rateInfoParams={rateInfoParams}
      deadline={deadline}
      quoteId={quoteId}
      quoteVerified={quoteVerified}
      quoteExpiration={quoteExpiration}
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
      feeWrapper={feeWrapper}
    />
  )
}
