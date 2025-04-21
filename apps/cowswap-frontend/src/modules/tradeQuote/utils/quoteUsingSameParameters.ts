import { WRAPPED_NATIVE_CURRENCIES } from '@cowprotocol/common-const'
import { getIsNativeToken } from '@cowprotocol/common-utils'
import { SupportedChainId, QuoteBridgeRequest } from '@cowprotocol/cow-sdk'

import { Nullish } from 'types'

import type { AppDataInfo, CowHook } from 'modules/appData'

import type { TradeQuoteState } from '../state/tradeQuoteAtom'

/**
 * Checks if the parameters for the current quote are correct
 *
 * Quotes are only valid for a given token-pair and amount. If any of these parameter change, the fee needs to be re-fetched
 */
export function quoteUsingSameParameters(
  chainId: SupportedChainId,
  currentQuote: TradeQuoteState,
  nextParams: Nullish<QuoteBridgeRequest>,
  currentAppData: AppDataInfo['doc'] | undefined,
  appData: AppDataInfo['doc'] | undefined,
): boolean {
  const currentParams = currentQuote.quote?.quoteResults.tradeParameters
  if (!currentParams || !nextParams) return false

  const isNativeToken = getIsNativeToken(chainId, nextParams.sellTokenAddress)
  const wrappedToken = WRAPPED_NATIVE_CURRENCIES[chainId]
  /**
   * Due to CoW Protocol design, we do
   */
  const nextSellToken = isNativeToken ? wrappedToken.address.toLowerCase() : nextParams.sellTokenAddress.toLowerCase()

  if (currentQuote.bridgeQuote) {
    const bridgeTradeParams = currentQuote.bridgeQuote.tradeParameters
    const bridgePostHook = currentQuote.bridgeQuote.bridgeCallDetails.preAuthorizedBridgingHook.postHook

    return (
      compareAppDataWithoutQuoteData(
        removeBridgePostHook(currentAppData, bridgePostHook),
        removeBridgePostHook(appData, bridgePostHook),
      ) &&
      currentParams.owner === nextParams.owner &&
      currentParams.kind === nextParams.kind &&
      currentParams.amount === nextParams.amount.toString() &&
      bridgeTradeParams.validFor === nextParams.validFor &&
      bridgeTradeParams.receiver === nextParams.receiver &&
      currentParams.sellToken.toLowerCase() === nextSellToken &&
      bridgeTradeParams.sellTokenChainId === nextParams.sellTokenChainId &&
      bridgeTradeParams.buyTokenAddress.toLowerCase() === nextParams.buyTokenAddress.toLowerCase()
    )
  }

  return (
    compareAppDataWithoutQuoteData(currentAppData, appData) &&
    currentParams.owner === nextParams.owner &&
    currentParams.kind === nextParams.kind &&
    currentParams.amount === nextParams.amount.toString() &&
    currentParams.validFor === nextParams.validFor &&
    currentParams.receiver === nextParams.receiver &&
    currentParams.sellToken.toLowerCase() === nextSellToken &&
    currentParams.buyToken.toLowerCase() === nextParams.buyTokenAddress.toLowerCase()
  )
}

/**
 * Compares appData without taking into account the `quote` metadata
 */
function compareAppDataWithoutQuoteData(a: AppDataInfo['doc'] | undefined, b: AppDataInfo['doc'] | undefined): boolean {
  if (a === b) return true

  if (!a || !b) {
    return a === b
  }

  return removeQuoteMetadata(a) === removeQuoteMetadata(b)
}

/**
 * If appData is set and is valid, remove `quote` metadata from it
 */
function removeQuoteMetadata(appData: AppDataInfo['doc']): string {
  const { metadata: fullMetadata, environment: _e, ...rest } = appData
  const { quote: _, referrer: _1, replacedOrder: _2, utm: _3, widget: _4, ...metadata } = fullMetadata
  return JSON.stringify({ ...rest, metadata })
}

function removeBridgePostHook(
  appData: AppDataInfo['doc'] | undefined,
  postHook: CowHook,
): AppDataInfo['doc'] | undefined {
  if (!appData) return appData

  const copy = { ...appData }

  if (copy.metadata.hooks?.post) {
    copy.metadata.hooks.post = copy.metadata.hooks.post.filter((hook) => {
      return (
        hook.target !== postHook.target && hook.callData !== postHook.callData && hook.gasLimit !== postHook.gasLimit
      )
    })

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
