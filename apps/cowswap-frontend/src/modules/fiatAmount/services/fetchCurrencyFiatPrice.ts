import { Token } from '@uniswap/sdk-core'

import { LONG_PRECISION } from 'legacy/constants'

import {
  COINGECKO_RATE_LIMIT_TIMEOUT,
  CoingeckoRateLimitError,
  getCoingeckoPrice,
  UnsupporedCoingeckoPlatformError,
} from '../apis/getCoingeckoPrice'
import { getCowProtocolFiatPrice } from '../apis/getCowProtocolFiatPrice'

let coingeckoRateLimitHitTimestamp: null | number = null

/**
 * Fetches fiat price for a given currency from coingecko or CowProtocol
 * CowProtocol is used as a fallback
 * When coingecko rate limit is hit, CowProtocol will be used for 1 minute
 */
export function fetchCurrencyFiatPrice(currency: Token, usdcPrice$: Promise<number | null>): Promise<number | null> {
  const shouldSkipCoingecko =
    !!coingeckoRateLimitHitTimestamp && Date.now() - coingeckoRateLimitHitTimestamp < COINGECKO_RATE_LIMIT_TIMEOUT

  if (coingeckoRateLimitHitTimestamp && !shouldSkipCoingecko) {
    coingeckoRateLimitHitTimestamp = null
  }

  const request = shouldSkipCoingecko
    ? getCowProtocolFiatPrice(currency, usdcPrice$)
    : getCoingeckoPrice(currency).catch((error) => {
        if (error instanceof CoingeckoRateLimitError) {
          coingeckoRateLimitHitTimestamp = Date.now()
          console.error('Coingecko request limit reached')
        } else if (!(error instanceof UnsupporedCoingeckoPlatformError)) {
          console.error('Cannot fetch coingecko price', error)
        }

        return getCowProtocolFiatPrice(currency, usdcPrice$)
      })

  return request
    .catch((error) => {
      console.error('Cannot fetch fiat price', { error })
      return null
    })
    .then((result) => {
      return result === null ? result : +result.toFixed(LONG_PRECISION)
    })
}
