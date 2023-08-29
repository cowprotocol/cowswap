import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { Token } from '@uniswap/sdk-core'

import { LONG_PRECISION } from 'legacy/constants'

import {
  COINGECK_PLATFORMS,
  COINGECKO_RATE_LIMIT_TIMEOUT,
  CoingeckoRateLimitError,
  getCoingeckoFiatPrice,
} from '../apis/getCoingeckoFiatPrice'
import { getCowProtocolFiatPrice } from '../apis/getCowProtocolFiatPrice'

let coingeckoRateLimitHitTimestamp: null | number = null

function getShouldSkipCoingecko(currency: Token): boolean {
  const chainId = currency.chainId as SupportedChainId

  if (!COINGECK_PLATFORMS[chainId]) return true

  return !!coingeckoRateLimitHitTimestamp && Date.now() - coingeckoRateLimitHitTimestamp < COINGECKO_RATE_LIMIT_TIMEOUT
}

/**
 * Fetches fiat price for a given currency from coingecko or CowProtocol
 * CoW Protocol Orderbook API is used as a fallback
 * When Coingecko rate limit is hit, CowProtocol will be used for 1 minute
 */
export function fetchCurrencyFiatPrice(
  currency: Token,
  getUsdcPrice: () => Promise<number | null>
): Promise<number | null> {
  const shouldSkipCoingecko = getShouldSkipCoingecko(currency)

  if (coingeckoRateLimitHitTimestamp && !shouldSkipCoingecko) {
    coingeckoRateLimitHitTimestamp = null
  }

  const request = shouldSkipCoingecko
    ? getCowProtocolFiatPrice(currency, getUsdcPrice)
    : getCoingeckoFiatPrice(currency).catch((error) => {
        if (error instanceof CoingeckoRateLimitError) {
          coingeckoRateLimitHitTimestamp = Date.now()
          console.error('Coingecko request limit reached')
        } else {
          console.error('Cannot fetch coingecko price', error)
        }

        return getCowProtocolFiatPrice(currency, getUsdcPrice)
      })

  return request
    .catch((error) => {
      console.error('Cannot fetch fiat price', { error })
      return Promise.reject(error)
    })
    .then((result) => {
      return result === null ? result : +result.toFixed(LONG_PRECISION)
    })
}
