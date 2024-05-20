import { SupportedChainId, mapSupportedNetworks } from '@cowprotocol/cow-sdk'
import { Fraction, Token } from '@uniswap/sdk-core'

import { RateLimitError, UnknownCurrencyError } from '../apis/errors'
import { COINGECKO_PLATFORMS, COINGECKO_RATE_LIMIT_TIMEOUT, getCoingeckoUsdPrice } from '../apis/getCoingeckoUsdPrice'
import { getCowProtocolUsdPrice } from '../apis/getCowProtocolUsdPrice'
import { DEFILLAMA_PLATFORMS, DEFILLAMA_RATE_LIMIT_TIMEOUT, getDefillamaUsdPrice } from '../apis/getDefillamaUsdPrice'

type UnknownCurrencies = { [address: string]: true }
type UnknownCurrenciesMap = Record<SupportedChainId, UnknownCurrencies>

let coingeckoRateLimitHitTimestamp: null | number = null
let defillamaRateLimitHitTimestamp: null | number = null

const coingeckoUnknownCurrencies: Record<SupportedChainId, UnknownCurrencies> = mapSupportedNetworks({})
const defillamaUnknownCurrencies: Record<SupportedChainId, UnknownCurrencies> = mapSupportedNetworks({})

function getShouldSkipCoingecko(currency: Token): boolean {
  return getShouldSkipPriceSource(
    currency,
    COINGECKO_PLATFORMS,
    coingeckoUnknownCurrencies,
    coingeckoRateLimitHitTimestamp,
    COINGECKO_RATE_LIMIT_TIMEOUT
  )
}

function getShouldSkipDefillama(currency: Token): boolean {
  return getShouldSkipPriceSource(
    currency,
    DEFILLAMA_PLATFORMS,
    defillamaUnknownCurrencies,
    defillamaRateLimitHitTimestamp,
    DEFILLAMA_RATE_LIMIT_TIMEOUT
  )
}

function getShouldSkipPriceSource(
  currency: Token,
  platforms: Record<SupportedChainId, string | null>,
  unknownCurrenciesMap: UnknownCurrenciesMap,
  rateLimitTimestamp: null | number,
  timeout: number
): boolean {
  const chainId = currency.chainId as SupportedChainId

  if (!platforms[chainId]) return true

  if (unknownCurrenciesMap[chainId][currency.address.toLowerCase()]) return true

  return !!rateLimitTimestamp && Date.now() - rateLimitTimestamp < timeout
}

/**
 * Fetches USD price for a given currency from coingecko or CowProtocol
 * CoW Protocol Orderbook API is used as a fallback
 * When Coingecko rate limit is hit, CowProtocol will be used for 1 minute
 */
export function fetchCurrencyUsdPrice(
  currency: Token,
  getUsdcPrice: () => Promise<Fraction | null>
): Promise<Fraction | null> {
  const shouldSkipCoingecko = getShouldSkipCoingecko(currency)
  const shouldSkipDefillama = getShouldSkipDefillama(currency)

  if (coingeckoRateLimitHitTimestamp && !shouldSkipCoingecko) {
    coingeckoRateLimitHitTimestamp = null
  }

  if (defillamaRateLimitHitTimestamp && !shouldSkipDefillama) {
    defillamaRateLimitHitTimestamp = null
  }

  function getCowPrice(currency: Token): Promise<Fraction | null> {
    return getCowProtocolUsdPrice(currency, getUsdcPrice).catch((error) => {
      console.error('Cannot fetch USD price', { error })
      return Promise.reject(error)
    })
  }

  // No coingecko. Try Defillama, then cow
  if (shouldSkipCoingecko) {
    return getDefillamaUsdPrice(currency).catch(
      handleErrorFactory(currency, defillamaRateLimitHitTimestamp, defillamaUnknownCurrencies, getCowPrice)
    )
  }
  // No Defillama. Try coingecko, then cow
  if (shouldSkipDefillama) {
    return getCoingeckoUsdPrice(currency).catch(
      handleErrorFactory(currency, coingeckoRateLimitHitTimestamp, coingeckoUnknownCurrencies, getCowPrice)
    )
  }
  // Both coingecko and defillama available. Try coingecko, then defillama, then cow
  return getCoingeckoUsdPrice(currency)
    .catch(
      handleErrorFactory(currency, coingeckoRateLimitHitTimestamp, coingeckoUnknownCurrencies, getDefillamaUsdPrice)
    )
    .catch(handleErrorFactory(currency, defillamaRateLimitHitTimestamp, defillamaUnknownCurrencies, getCowPrice))
}

function handleErrorFactory(
  currency: Token,
  rateLimitTimestamp: null | number,
  unknownCurrenciesMap: UnknownCurrenciesMap,
  fetchPriceFallback: (currency: Token) => Promise<Fraction | null>
): ((reason: any) => Fraction | PromiseLike<Fraction | null> | null) | null | undefined {
  return (error) => {
    if (error instanceof RateLimitError) {
      rateLimitTimestamp = Date.now()
    } else if (error instanceof UnknownCurrencyError) {
      // Mark currency as unknown
      unknownCurrenciesMap[currency.chainId as SupportedChainId][currency.address.toLowerCase()] = true
    } else {
    }

    return fetchPriceFallback(currency)
  }
}
