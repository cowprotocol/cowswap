import { WRAPPED_NATIVE_CURRENCIES } from '@cowprotocol/common-const'
import { getIsNativeToken } from '@cowprotocol/common-utils'
import { areHooksEqual, QuoteBridgeRequest, SupportedChainId } from '@cowprotocol/cow-sdk'

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

  const nextSellToken = getErc20TokenAddress(chainId, nextParams.sellTokenAddress)
  const currentSellToken = getErc20TokenAddress(chainId, currentParams.sellToken)

  if (currentQuote.bridgeQuote) {
    const bridgeTradeParams = currentQuote.bridgeQuote.tradeParameters
    const bridgePostHook = currentQuote.bridgeQuote.bridgeCallDetails.preAuthorizedBridgingHook.postHook

    const cases = [
      compareAppDataWithoutQuoteData(
        removeBridgePostHook(currentAppData, bridgePostHook),
        removeBridgePostHook(appData, bridgePostHook),
      ),
      currentParams.owner === nextParams.owner,
      currentParams.kind === nextParams.kind,
      currentParams.amount === nextParams.amount.toString(),
      bridgeTradeParams.validFor === nextParams.validFor,
      bridgeTradeParams.receiver === nextParams.receiver,
      bridgeTradeParams.slippageBps === nextParams.slippageBps,
      areAddressesEqual(currentSellToken, nextSellToken),
      bridgeTradeParams.sellTokenChainId === nextParams.sellTokenChainId,
      areAddressesEqual(bridgeTradeParams.buyTokenAddress, nextParams.buyTokenAddress),
    ]

    return cases.every(Boolean)
  }

  const cases = [
    compareAppDataWithoutQuoteData(currentAppData, appData),
    currentParams.owner === nextParams.owner,
    currentParams.kind === nextParams.kind,
    currentParams.amount === nextParams.amount.toString(),
    currentParams.validFor === nextParams.validFor,
    currentParams.receiver === nextParams.receiver,
    areAddressesEqual(currentSellToken, nextSellToken),
    areAddressesEqual(currentParams.buyToken, nextParams.buyTokenAddress),
  ]

  return cases.every(Boolean)
}

// todo move to common-utils
/**
 * Returns the ERC20 token address for a given token address (if it's native, returns the wrapped token address)
*/
function getErc20TokenAddress(chainId: SupportedChainId, tokenAddress: string): string {
  const isNativeToken = getIsNativeToken(chainId, tokenAddress)
  const wrappedToken = WRAPPED_NATIVE_CURRENCIES[chainId]
  return isNativeToken ? wrappedToken.address : tokenAddress
}

// todo move to common-utils
function areAddressesEqual(a: string, b: string): boolean {
  return a.toLowerCase() === b.toLowerCase()
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
  const { metadata: fullMetadata, ...rest } = appData
  const { quote: _, utm: __, ...metadata } = fullMetadata

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
