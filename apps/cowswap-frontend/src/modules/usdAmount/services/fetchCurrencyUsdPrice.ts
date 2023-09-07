import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { Fraction, Token } from '@uniswap/sdk-core'

import {
  COINGECK_PLATFORMS,
  COINGECKO_RATE_LIMIT_TIMEOUT,
  CoingeckoRateLimitError,
  getCoingeckoUsdPrice,
} from '../apis/getCoingeckoUsdPrice'
import { getCowProtocolUsdPrice } from '../apis/getCowProtocolUsdPrice'

let coingeckoRateLimitHitTimestamp: null | number = null

function getShouldSkipCoingecko(currency: Token): boolean {
  const chainId = currency.chainId as SupportedChainId

  if (!COINGECK_PLATFORMS[chainId]) return true

  return !!coingeckoRateLimitHitTimestamp && Date.now() - coingeckoRateLimitHitTimestamp < COINGECKO_RATE_LIMIT_TIMEOUT
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

  if (coingeckoRateLimitHitTimestamp && !shouldSkipCoingecko) {
    coingeckoRateLimitHitTimestamp = null
  }

  const request = shouldSkipCoingecko
    ? getCowProtocolUsdPrice(currency, getUsdcPrice)
    : getCoingeckoUsdPrice(currency).catch((error) => {
        if (error instanceof CoingeckoRateLimitError) {
          coingeckoRateLimitHitTimestamp = Date.now()
          console.error('Coingecko request limit reached')
        } else {
          console.error('Cannot fetch coingecko price', error)
        }

        return getCowProtocolUsdPrice(currency, getUsdcPrice)
      })

  return request
    .catch((error) => {
      console.error('Cannot fetch USD price', { error })
      return Promise.reject(error)
    })
    .then((result) => {
      return result
    })
}
