import { WRAPPED_NATIVE_CURRENCIES } from '@cowprotocol/common-const'
import { getIsNativeToken } from '@cowprotocol/common-utils'
import { SupportedChainId, QuoteBridgeRequest, areHooksEqual } from '@cowprotocol/cow-sdk'

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

  const normalizePartnerFee = (doc: AppDataInfo['doc']) => {
    const { metadata } = doc
    if (metadata?.partnerFee) {
      const partnerFee = Array.isArray(metadata.partnerFee) ? metadata.partnerFee[0] : metadata.partnerFee
      return {
        ...doc,
        metadata: {
          ...metadata,
          partnerFee: {
            ...partnerFee,
            priceImprovementBps: 0,
            maxVolumeBps: 0,
            recipient: partnerFee.recipient || '',
          },
        },
      } as AppDataInfo['doc']
    }
    return doc
  }

  return removeQuoteMetadata(normalizePartnerFee(a)) === removeQuoteMetadata(normalizePartnerFee(b))
}

/**
 * If appData is set and is valid, remove `quote` metadata from it
 */
function removeQuoteMetadata(appData: AppDataInfo['doc']): string {
  const { metadata: fullMetadata, ...rest } = appData
  const { quote: _, ...metadata } = fullMetadata

  const obj = { ...rest, metadata }
  return jsonStringify(obj)
}

function removeBridgePostHook(
  appData: AppDataInfo['doc'] | undefined,
  postHook: CowHook,
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
