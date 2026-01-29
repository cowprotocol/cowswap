import { QuoteBridgeRequest } from '@cowprotocol/sdk-bridging'

import jsonStringify from 'json-stringify-deterministic'
import { Nullish } from 'types'

import type { AppDataInfo, CowHook } from 'modules/appData'

import type { TradeQuoteState } from '../state/tradeQuoteAtom'

/**
 * Checks if the parameters for the current quote are correct
 *
 * Quotes are only valid for a given token-pair and amount. If any of these parameter change, the fee needs to be re-fetched
 */
export function quoteUsingSameParameters(
  currentQuote: TradeQuoteState,
  nextParams: Nullish<QuoteBridgeRequest>,
  currentAppData: AppDataInfo['doc'] | undefined,
  appData: AppDataInfo['doc'] | undefined,
  hasSmartSlippage: boolean | undefined,
): boolean {
  const currentParams = currentQuote.quote?.quoteResults.tradeParameters
  if (!currentParams || !nextParams) return false

  // Do not compare slippage if the request contains smart slippage
  const slippageCheck = hasSmartSlippage ? true : compareSlippage(currentParams.slippageBps, nextParams.swapSlippageBps)

  if (currentQuote.bridgeQuote) {
    const bridgeTradeParams = currentQuote.bridgeQuote.tradeParameters
    const bridgePostHook = currentQuote.bridgeQuote.bridgeCallDetails?.preAuthorizedBridgingHook?.postHook

    const { isChanged: isAppDataChanged, diff: appDataDiff } = compareAppDataWithoutQuoteData(
      removeBridgePostHook(currentAppData, bridgePostHook),
      removeBridgePostHook(appData, bridgePostHook),
    )

    const cases = [
      [isAppDataChanged, 'appData', appDataDiff],
      [currentParams.owner === nextParams.owner, 'owner'],
      [currentParams.kind === nextParams.kind, 'kind'],
      [currentParams.amount === nextParams.amount.toString(), 'amount'],
      [bridgeTradeParams.validFor === nextParams.validFor, 'validFor'],
      [bridgeTradeParams.receiver === nextParams.receiver, 'receiver'],
      // Use currentParams.slippageBps since bridgeTradeParams doesn't preserve slippageBps when auto-slippage is enabled
      [slippageCheck, 'slippageBps', currentParams.slippageBps, nextParams.swapSlippageBps],
      [sameAddress(currentParams.sellToken, nextParams.sellTokenAddress), 'sellToken'],
      [bridgeTradeParams.sellTokenChainId === nextParams.sellTokenChainId, 'sellTokenChainId'],
      [sameAddress(bridgeTradeParams.buyTokenAddress, nextParams.buyTokenAddress), 'buyTokenAddress'],
      [bridgeTradeParams.buyTokenChainId === nextParams.buyTokenChainId, 'buyTokenChainId'],
    ]

    const changes = cases.filter((i) => !Boolean(i[0]))

    if (changes.length) {
      console.debug('[QUOTE FETCHING] bridge quote params has changes: ', changes)
    }

    return changes.length === 0
  }

  const { isChanged: isAppDataChanged, diff: appDataDiff } = compareAppDataWithoutQuoteData(currentAppData, appData)

  const cases = [
    [isAppDataChanged, 'appData', appDataDiff],
    [currentParams.owner === nextParams.owner, 'owner'],
    [currentParams.kind === nextParams.kind, 'kind'],
    [currentParams.amount === nextParams.amount.toString(), 'amount'],
    [currentParams.validFor === nextParams.validFor, 'validFor'],
    [currentParams.receiver === nextParams.receiver, 'receiver'],
    /**
     * Check slippage only if it is set in nextParams
     * Because we should refetch quote only when a user changed slippage
     * Auto-slippage should not trigger quote refetching
     * See how slippageBps is defined in `useQuoteParams()`
     */
    [slippageCheck, 'slippageBps', currentParams.slippageBps, nextParams.swapSlippageBps],
    [sameAddress(currentParams.sellToken, nextParams.sellTokenAddress), 'sellToken'],
    [sameAddress(currentParams.buyToken, nextParams.buyTokenAddress), 'buyToken'],
  ]

  const changes = cases.filter((i) => !Boolean(i[0]))

  if (changes.length) {
    console.debug('[QUOTE FETCHING] swap quote params has changes: ', changes)
  }

  return changes.length === 0
}

/**
 * Compares slippage values only if they are set in both current and next params
 *
 */
function compareSlippage(currentSlippage: number | undefined, nextSlippage: number | undefined): boolean {
  return !nextSlippage || !currentSlippage || currentSlippage === nextSlippage
}

function sameAddress(a: string | undefined | null, b: string | undefined | null): boolean {
  if (typeof a !== 'string' || typeof b !== 'string') return false
  if (!a || !b) return false

  return a.toLowerCase() === b.toLowerCase()
}

/**
 * Compares appData without taking into account the `quote` metadata
 */
function compareAppDataWithoutQuoteData(
  a: AppDataInfo['doc'] | undefined,
  b: AppDataInfo['doc'] | undefined,
): { isChanged: boolean; diff?: string[] } {
  if (a === b) return { isChanged: true }

  if (!a || !b) {
    return { isChanged: a === b }
  }

  const aMetaData = removeQuoteMetadata(a)
  const bMetaData = removeQuoteMetadata(b)

  return { isChanged: aMetaData === bMetaData, diff: [aMetaData, bMetaData] }
}

/**
 * If appData is set and is valid, remove `quote` metadata from it
 */
function removeQuoteMetadata(appData: AppDataInfo['doc']): string {
  const { metadata: fullMetadata, ...rest } = appData
  const { partnerFee, hooks, referrer, replacedOrder } = fullMetadata

  const obj = {
    ...rest,
    metadata: {
      partnerFee: partnerFee ?? undefined,
      hooks: hooks ?? undefined,
      referrer: referrer ?? undefined,
      replacedOrder: replacedOrder ?? undefined,
    },
  }
  return jsonStringify(obj)
}

function removeBridgePostHook(
  appData: AppDataInfo['doc'] | undefined,
  postHook: CowHook | undefined,
): AppDataInfo['doc'] | undefined {
  if (!appData) return appData

  const copy = { ...appData }

  if (copy.metadata.hooks?.post) {
    copy.metadata.hooks.post = copy.metadata.hooks.post.filter((hook) => !areHooksEqual(hook, postHook))

    if (!copy.metadata.hooks.post.length) {
      copy.metadata.hooks.post = undefined
    }

    if (!copy.metadata.hooks.pre?.length) {
      copy.metadata.hooks.pre = undefined
    }
  }

  if (copy.metadata.hooks && !copy.metadata.hooks.post && !copy.metadata.hooks.pre) {
    copy.metadata.hooks = undefined
  }

  return copy
}

function areHooksEqual(hookA: CowHook | undefined, hookB: CowHook | undefined): boolean {
  return hookA?.callData === hookB?.callData && hookA?.gasLimit === hookB?.gasLimit && hookA?.target === hookB?.target
}
