import { ReactNode, useCallback, useMemo } from 'react'

import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { useWalletInfo } from '@cowprotocol/wallet'

import {
  BridgeAccordionSummary,
  useQuoteBridgeContext,
  useQuoteSwapContext,
  useShouldDisplayBridgeDetails,
  QuoteDetails,
} from 'modules/bridge'
import { useTradeState } from 'modules/trade'
import { RecipientRow } from 'modules/trade/pure/RecipientRow'
import { useTradeQuote } from 'modules/tradeQuote'
import { TradeRateDetails } from 'modules/tradeWidgetAddons'

import { RateInfoParams } from 'common/pure/RateInfo'

// Helper to resolve recipient chain ID safely
function getRecipientChainId(
  bridgeContext: ReturnType<typeof useQuoteBridgeContext>,
  fallbackChainId: SupportedChainId,
): SupportedChainId {
  const bridgeChainId = bridgeContext?.buyAmount?.currency?.chainId
  return bridgeChainId && bridgeChainId in SupportedChainId ? (bridgeChainId as SupportedChainId) : fallbackChainId
}

export interface SwapRateDetailsProps {
  rateInfoParams: RateInfoParams
  deadline: number
}

export function SwapRateDetails({ rateInfoParams, deadline }: SwapRateDetailsProps): ReactNode {
  const { isLoading: isRateLoading, bridgeQuote } = useTradeQuote()
  const { chainId } = useWalletInfo()
  const { state } = useTradeState()

  const shouldDisplayBridgeDetails = useShouldDisplayBridgeDetails()
  const providerDetails = bridgeQuote?.providerInfo
  const bridgeEstimatedTime = bridgeQuote?.expectedFillTimeSeconds

  const swapContext = useQuoteSwapContext()
  const bridgeContext = useQuoteBridgeContext()

  const recipientChainId = getRecipientChainId(bridgeContext, chainId)
  const recipientRow = useMemo(() => {
    if (!state?.recipient) return null

    return <RecipientRow chainId={recipientChainId} recipient={state.recipientAddress || state.recipient} />
  }, [recipientChainId, state?.recipient, state?.recipientAddress])

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
            {recipientRow}
          </>
        )
      }
      feeWrapper={shouldDisplayBridgeDetails && providerDetails ? feeWrapper : undefined}
    />
  )
}
