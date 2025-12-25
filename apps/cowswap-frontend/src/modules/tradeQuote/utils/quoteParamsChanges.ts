import type { QuoteBridgeRequest } from '@cowprotocol/sdk-bridging'

import deepEqual from 'fast-deep-equal'

import type { TradeQuoteState } from '../state/tradeQuoteAtom'

export function checkOnlySlippageBpsChanged(
  quoteParams: QuoteBridgeRequest | undefined,
  prevQuoteParams: QuoteBridgeRequest | undefined,
  tradeQuote: TradeQuoteState,
): boolean {
  const onlySlippageBpsChanged =
    !tradeQuote.isLoading &&
    quoteParams?.slippageBps !== prevQuoteParams?.slippageBps &&
    deepEqual(
      { ...quoteParams, slippageBps: undefined, signer: undefined },
      { ...prevQuoteParams, slippageBps: undefined, signer: undefined },
    )

  return onlySlippageBpsChanged
}
