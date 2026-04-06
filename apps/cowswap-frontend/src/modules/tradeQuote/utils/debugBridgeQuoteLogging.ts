import type { BridgeQuoteResults, MultiQuoteResult } from '@cowprotocol/sdk-bridging'

/** Set `localStorage.setItem('debugBridgeQuotes', '1')` and reload to log bridge multi-quote / Across debug lines. */
const STORAGE_KEY = 'debugBridgeQuotes'

const LOG_PREFIX = '[cowswap:bridge-quote]'

export const ACROSS_PROVIDER_DAPP_ID = 'cow-sdk://bridging/providers/across'

export function isBridgeQuoteDebugEnabled(): boolean {
  return typeof window !== 'undefined' && window.localStorage?.getItem(STORAGE_KEY) === '1'
}

function stringifyForDebug(value: unknown): unknown {
  try {
    return JSON.parse(JSON.stringify(value, (_k, v) => (typeof v === 'bigint' ? v.toString() : v)))
  } catch {
    return value
  }
}

/**
 * Bridge leg “intermediate” token used on the source chain for the Across (or other) hop is exposed as
 * `tradeParameters.sellTokenAddress` (see `getBridgeIntermediateTokenAddress`).
 */
export function summarizeBridgeQuoteForDebug(bridge: BridgeQuoteResults): Record<string, unknown> {
  return {
    providerDappId: bridge.providerInfo?.dappId,
    providerName: bridge.providerInfo?.name,
    intermediateTokenAddress: bridge.tradeParameters?.sellTokenAddress,
    tradeParameters: stringifyForDebug(bridge.tradeParameters),
    amountsAndCosts: stringifyForDebug(bridge.amountsAndCosts),
    fees: stringifyForDebug(bridge.fees),
    limits: stringifyForDebug(bridge.limits),
    bridgeCallDetailsPreview: stringifyForDebug(bridge.bridgeCallDetails),
    expectedFillTimeSeconds: bridge.expectedFillTimeSeconds,
    isSell: bridge.isSell,
  }
}

export function logBridgeMultiQuoteResult(
  phase: 'onQuoteResult' | 'getBestQuoteSettled',
  result: MultiQuoteResult,
): void {
  if (!isBridgeQuoteDebugEnabled()) return

  const isAcross = result.providerDappId === ACROSS_PROVIDER_DAPP_ID

  console.info(`${LOG_PREFIX} ${phase}`, {
    providerDappId: result.providerDappId,
    isAcrossProvider: isAcross,
    hasQuote: !!result.quote,
    hasError: !!result.error,
    error: result.error ? String(result.error) : undefined,
    bridgeSummary: result.quote?.bridge ? summarizeBridgeQuoteForDebug(result.quote.bridge) : undefined,
  })
}
