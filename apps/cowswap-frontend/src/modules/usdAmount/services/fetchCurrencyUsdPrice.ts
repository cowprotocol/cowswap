import { SupportedChainId, mapSupportedNetworks } from '@cowprotocol/cow-sdk'
import { PersistentStateByChain } from '@cowprotocol/types'
import { Fraction, Token } from '@uniswap/sdk-core'

import { RateLimitError, UnknownCurrencyError } from '../apis/errors'
import { getBffUsdPrice } from '../apis/getBffUsdPrice'
import { getCowProtocolUsdPrice } from '../apis/getCowProtocolUsdPrice'
import { DEFILLAMA_PLATFORMS, DEFILLAMA_RATE_LIMIT_TIMEOUT, getDefillamaUsdPrice } from '../apis/getDefillamaUsdPrice'

type UnknownCurrencies = { [address: string]: true }
type UnknownCurrenciesMap = PersistentStateByChain<UnknownCurrencies>

let defillamaRateLimitHitTimestamp: null | number = null

const defillamaUnknownCurrencies: UnknownCurrenciesMap = mapSupportedNetworks({})
const bffUnknownCurrencies: UnknownCurrenciesMap = mapSupportedNetworks({})

function getShouldSkipDefillama(currency: Token): boolean {
  return getShouldSkipPriceSource(
    currency,
    DEFILLAMA_PLATFORMS,
    defillamaUnknownCurrencies,
    defillamaRateLimitHitTimestamp,
    DEFILLAMA_RATE_LIMIT_TIMEOUT,
  )
}

function getShouldSkipPriceSource(
  currency: Token,
  platforms: Record<SupportedChainId, string | null> | null,
  unknownCurrenciesMap: UnknownCurrenciesMap,
  rateLimitTimestamp: null | number,
  timeout: number,
): boolean {
  const chainId = currency.chainId as SupportedChainId
  const unknownCurrenciesForChain = unknownCurrenciesMap[chainId] || {}

  if (platforms && !platforms[chainId]) return true

  if (unknownCurrenciesForChain[currency.address.toLowerCase()]) return true

  return !!rateLimitTimestamp && Date.now() - rateLimitTimestamp < timeout
}

function getShouldSkipBff(currency: Token): boolean {
  return getShouldSkipPriceSource(currency, null, bffUnknownCurrencies, null, 0)
}

/**
 * Fetches USD price for a given currency from BFF, Defillama, or CowProtocol
 * Tries sources in that order
 */
export async function fetchCurrencyUsdPrice(currency: Token): Promise<Fraction | null> {
  const shouldSkipBff = getShouldSkipBff(currency)
  const shouldSkipDefillama = getShouldSkipDefillama(currency)

  if (defillamaRateLimitHitTimestamp && !shouldSkipDefillama) {
    defillamaRateLimitHitTimestamp = null
  }

  function getCowPrice(currency: Token): Promise<Fraction | null> {
    return getCowProtocolUsdPrice(currency).catch((error) => {
      console.error('Cannot fetch USD price', { error })
      return Promise.reject(error)
    })
  }

  // Try BFF first, then fall back to Defillama, then CoW
  if (!shouldSkipBff) {
    return getBffUsdPrice(currency)
      .catch(handleErrorFactory(currency, null, bffUnknownCurrencies, getDefillamaUsdPrice))
      .catch(handleErrorFactory(currency, defillamaRateLimitHitTimestamp, defillamaUnknownCurrencies, getCowPrice))
  }

  // If BFF is skipped, try Defillama
  if (!shouldSkipDefillama) {
    return getDefillamaUsdPrice(currency).catch(
      handleErrorFactory(currency, defillamaRateLimitHitTimestamp, defillamaUnknownCurrencies, getCowPrice),
    )
  }

  // CowProtocolUsdPrice is only available for supported chains
  if (currency.chainId in SupportedChainId) {
    // If all other sources are skipped, use CoW as last resort
    return getCowPrice(currency)
  }

  return null
}

function handleErrorFactory(
  currency: Token,
  rateLimitTimestamp: null | number,
  unknownCurrenciesMap: UnknownCurrenciesMap,
  fetchPriceFallback: (currency: Token) => Promise<Fraction | null>,
// TODO: Replace any with proper type definitions
// eslint-disable-next-line @typescript-eslint/no-explicit-any
): ((reason: any) => Fraction | PromiseLike<Fraction | null> | null) | null | undefined {
  return (error) => {
    if (error instanceof RateLimitError) {
      rateLimitTimestamp = Date.now()
    } else if (error instanceof UnknownCurrencyError) {
      // Mark currency as unknown
      const chainId = currency.chainId as SupportedChainId
      const unknownCurrenciesForChain = unknownCurrenciesMap[chainId]
      const addressToLowercase = currency.address.toLowerCase()

      if (unknownCurrenciesForChain === undefined) {
        unknownCurrenciesMap[chainId] = { [addressToLowercase]: true }
      } else {
        unknownCurrenciesForChain[addressToLowercase] = true
      }
    } else {
    }

    return fetchPriceFallback(currency)
  }
}
