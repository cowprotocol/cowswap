import { useSetAtom } from 'jotai'
import { useMemo, useRef, type MutableRefObject } from 'react'
import { getQuoteAmountsAndCosts } from '@cowprotocol/cow-sdk'
import { OrderKind, OrderParameters, PriceQuality, QuoteAndPost, SupportedChainId } from '@cowprotocol/cow-sdk'
import { BridgeQuoteResults, QuoteBridgeRequest } from '@cowprotocol/sdk-bridging'

import { QuoteApiError, QuoteApiErrorCodes } from 'api/cowProtocol/errors/QuoteError'

import { useProcessUnsupportedTokenError } from './useProcessUnsupportedTokenError'

import { TradeQuoteState, updateTradeQuoteAtom } from '../state/tradeQuoteAtom'
import { SellTokenAddress } from '../state/tradeQuoteInputAtom'
import { TradeQuoteFetchParams } from '../types'
import { useVolumeFee } from 'modules/volumeFee'

function requestedAmountToString(value: string | bigint | undefined): string {
  if (value === undefined || value === null) return ''
  return typeof value === 'string' ? value : String(value)
}

function isStaleQuote(
  currentAmountRef: MutableRefObject<string | null>,
  quote: QuoteAndPost,
  partnerFeeBps: number,
): boolean {
  const quoteAmountsAndCosts = getQuoteAmountsAndCosts({
    orderParams: quote.quoteResults.quoteResponse?.quote,
    slippagePercentBps: Number(quote?.quoteResults?.suggestedSlippageBps ?? 0),
    partnerFeeBps,
    protocolFeeBps: Number(quote?.quoteResults?.quoteResponse?.protocolFeeBps ?? 0),
  });

  const requestedAmount = requestedAmountToString(
    quote.quoteResults.quoteResponse?.quote?.kind === OrderKind.SELL
      ? quoteAmountsAndCosts.beforeAllFees.sellAmount
      : quoteAmountsAndCosts.beforeAllFees.buyAmount,
  )

  const inputAmount = currentAmountRef.current
  const isStale = inputAmount === null || inputAmount === '' || inputAmount !== requestedAmount;

  return isStale
}

function isStaleQuoteWithParams(
  lastQuoteParamsRef: MutableRefObject<QuoteBridgeRequest | null>,
  quoteParams: QuoteBridgeRequest,
) {
  console.log(lastQuoteParamsRef.current);

  return lastQuoteParamsRef.current?.amount !== quoteParams.amount ||
    lastQuoteParamsRef.current?.sellTokenChainId !== quoteParams.sellTokenChainId ||
    lastQuoteParamsRef.current?.sellTokenAddress !== quoteParams.sellTokenAddress ||
    lastQuoteParamsRef.current?.buyTokenChainId !== quoteParams.buyTokenChainId ||
    lastQuoteParamsRef.current?.buyTokenAddress !== quoteParams.buyTokenAddress
}

export interface TradeQuoteManager {
  setLoading(hasParamsChanged: boolean, quoteParams: QuoteBridgeRequest): void

  reset(): void

  onError(
    error: TradeQuoteState['error'],
    chainId: SupportedChainId,
    quoteParams: QuoteBridgeRequest,
    fetchParams: TradeQuoteFetchParams,
  ): void

  onResponse(data: QuoteAndPost, bridgeQuote: BridgeQuoteResults | null, fetchParams: TradeQuoteFetchParams, quoteParams: QuoteBridgeRequest): void
}

export function useTradeQuoteManager(
  sellTokenAddress: SellTokenAddress | undefined,
  currentAmountRef: MutableRefObject<string | null>,
): TradeQuoteManager | null {
  const update = useSetAtom(updateTradeQuoteAtom)
  const processUnsupportedTokenError = useProcessUnsupportedTokenError()

  const partnerFeeBps = useVolumeFee()?.volumeBps

  const lastQuoteParamsRef = useRef<QuoteBridgeRequest | null>(null)

  return useMemo(
    () =>
      sellTokenAddress
        ? {
            setLoading(hasParamsChanged: boolean, quoteParams: QuoteBridgeRequest) {
              console.log("SET LOADING", quoteParams);

              lastQuoteParamsRef.current = quoteParams

              update(sellTokenAddress, {
                isLoading: true,
                hasParamsChanged,
              })
            },
            reset() {
              console.log("RESET");

              lastQuoteParamsRef.current = null

              update(sellTokenAddress, { quote: null, isLoading: false })
            },
            onError(
              error: TradeQuoteState['error'],
              chainId: SupportedChainId,
              quoteParams: QuoteBridgeRequest,
              fetchParams: TradeQuoteFetchParams,
            ) {
              // if (isStaleQuote(currentAmountRef, orderQuote)) return

              update(sellTokenAddress, {
                error,
                fetchParams,
                isLoading: false,
                hasParamsChanged: false,
                isBridgeQuote: quoteParams.sellTokenChainId !== quoteParams.buyTokenChainId,
              })

              if (error instanceof QuoteApiError && error.type === QuoteApiErrorCodes.UnsupportedToken) {
                processUnsupportedTokenError(error, chainId, quoteParams)
              }
            },
            onResponse(
              quote: QuoteAndPost,
              bridgeQuote: BridgeQuoteResults | null,
              fetchParams: TradeQuoteFetchParams,
              quoteParams: QuoteBridgeRequest,
            ) {
              if (isStaleQuoteWithParams(lastQuoteParamsRef, quoteParams)) {
                console.log("DISCARDED BY LIGHT CHECK")
                lastQuoteParamsRef.current = null
                update(sellTokenAddress, { quote: null, isLoading: false })

                return
              }

              if (isStaleQuote(currentAmountRef, quote, partnerFeeBps ?? 0)) {
                console.log("DISCARDED BY AMOUNTS CHECK")
                lastQuoteParamsRef.current = null
                update(sellTokenAddress, { quote: null, isLoading: false })

                return
              }

              const isOptimalQuote = fetchParams.priceQuality === PriceQuality.OPTIMAL

              update(sellTokenAddress, {
                quote,
                bridgeQuote,
                ...(isOptimalQuote ? { isLoading: false } : null),
                error: null,
                hasParamsChanged: false,
                fetchParams,
              })
            },
          }
        : null,
    [update, processUnsupportedTokenError, sellTokenAddress, partnerFeeBps, currentAmountRef],
  )
}
