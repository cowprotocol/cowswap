import type { QuoteBridgeRequest } from '@cowprotocol/sdk-bridging'

import deepEqual from 'fast-deep-equal'

import type { TradeQuoteState } from '../state/tradeQuoteAtom'

export function checkOnlySlippageBpsChanged(
  quoteParams: QuoteBridgeRequest | undefined,
  prevQuoteParams: QuoteBridgeRequest | undefined,
  tradeQuote: TradeQuoteState,
): boolean {
  const slippageChanged =
    quoteParams?.swapSlippageBps !== prevQuoteParams?.swapSlippageBps ||
    quoteParams?.bridgeSlippageBps !== prevQuoteParams?.bridgeSlippageBps

  const onlySlippageBpsChanged =
    !tradeQuote.isLoading &&
    slippageChanged &&
    deepEqual(
      { ...quoteParams, swapSlippageBps: undefined, bridgeSlippageBps: undefined, signer: undefined },
      { ...prevQuoteParams, swapSlippageBps: undefined, bridgeSlippageBps: undefined, signer: undefined },
    )

  return onlySlippageBpsChanged
}
