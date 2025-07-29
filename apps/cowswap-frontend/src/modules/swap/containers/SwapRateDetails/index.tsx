import { ReactNode, useCallback, useState } from 'react'

import {
  BridgeAccordionSummary,
  useQuoteBridgeContext,
  useQuoteSwapContext,
  useShouldDisplayBridgeDetails,
  QuoteDetails,
} from 'modules/bridge'
import { useTradeQuote } from 'modules/tradeQuote'
import { TradeRateDetails, useRecipientDisplay } from 'modules/tradeWidgetAddons'

import { RateInfoParams } from 'common/pure/RateInfo'

export interface SwapRateDetailsProps {
  rateInfoParams: RateInfoParams
  deadline: number
  recipient?: string | null
  recipientEnsName?: string | null
  account?: string | null
}

// TODO: Break down this large function into smaller functions
// eslint-disable-next-line complexity
export function SwapRateDetails({
  rateInfoParams,
  deadline,
  recipient,
  recipientEnsName,
  account,
}: SwapRateDetailsProps): ReactNode {
  const { isLoading: isRateLoading, bridgeQuote } = useTradeQuote()

  const shouldDisplayBridgeDetails = useShouldDisplayBridgeDetails()

  const providerDetails = bridgeQuote?.providerInfo
  const bridgeEstimatedTime = bridgeQuote?.expectedFillTimeSeconds

  const swapContext = useQuoteSwapContext()
  const bridgeContext = useQuoteBridgeContext()

  const feeWrapper = useCallback(
    (feeElement: ReactNode, isOpen: boolean) => {
      let wrappedElement = feeElement

      if (providerDetails) {
        wrappedElement = (
          <BridgeAccordionSummary
            bridgeEstimatedTime={bridgeEstimatedTime}
            bridgeProtocol={providerDetails}
            isOpen={isOpen}
          >
            {wrappedElement}
          </BridgeAccordionSummary>
        )
      }

      return wrappedElement
    },
    [bridgeEstimatedTime, providerDetails],
  )

  // Track accordion expansion state
  const [isAccordionOpen, setIsAccordionOpen] = useState(false)

  const feeWrapperWithState = useCallback(
    (feeElement: ReactNode, isOpen: boolean) => {
      setIsAccordionOpen(isOpen)
      return feeWrapper(feeElement, isOpen)
    },
    [feeWrapper],
  )

  // Show recipient row when accordion is closed for bridge orders, always show for regular swaps
  const recipientRowWhenClosed = useRecipientDisplay({
    recipient,
    recipientEnsName,
    recipientChainId: bridgeContext?.buyAmount?.currency?.chainId, // Use bridge chain if available
    account,
    fallbackChainId: swapContext?.sellAmount?.currency?.chainId,
    // Only hide recipient row when accordion is open for bridge orders
    // For regular swaps, always show the recipient row
    isFeeDetailsOpen: shouldDisplayBridgeDetails ? isAccordionOpen : false,
  })

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
            <QuoteDetails
              bridgeProvider={providerDetails}
              swapContext={swapContext}
              bridgeContext={bridgeContext}
              recipient={recipient}
              recipientEnsName={recipientEnsName}
              account={account}
              recipientChainId={bridgeContext?.buyAmount?.currency?.chainId}
            />
          </>
        )
      }
      feeWrapper={feeWrapperWithState}
      bottomContent={recipientRowWhenClosed}
    />
  )
}
