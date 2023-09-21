import { FractionUtils } from '@cowprotocol/common-utils'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { Fraction, Token } from '@uniswap/sdk-core'

import ms from 'ms.macro'

import { fetchWithRateLimit } from 'common/utils/fetch'

export interface CoinGeckoUsdQuote {
  [address: string]: {
    usd: number
  }
}

export const COINGECK_PLATFORMS: Record<SupportedChainId, string | null> = {
  [SupportedChainId.MAINNET]: 'ethereum',
  [SupportedChainId.GNOSIS_CHAIN]: 'xdai',
  [SupportedChainId.GOERLI]: null,
}

const BASE_URL = 'https://api.coingecko.com/api/v3/simple/token_price'
const VS_CURRENCY = 'usd'
/**
 * This is a text of 429 HTTP code
 * https://saturncloud.io/blog/catching-javascript-fetch-failing-with-cloudflare-429-missing-cors-header/
 */
const FAILED_FETCH_ERROR = 'Failed to fetch'

const fetchRateLimitted = fetchWithRateLimit({
  // Allow 2 requests per second
  rateLimit: {
    tokensPerInterval: 2,
    interval: 'second',
  },
  // 2 retry attempts with 100ms delay
  backoff: {
    maxDelay: ms`0.1s`,
    numOfAttempts: 2,
  },
})

export const COINGECKO_RATE_LIMIT_TIMEOUT = ms`1m`

export class CoingeckoRateLimitError extends Error {
  constructor() {
    super('CoingeckoRateLimitError')
  }
}

export class CoingeckoUnknownCurrency extends Error {
  constructor() {
    super('CoingeckoUnknownCurrency')
  }
}

export async function getCoingeckoUsdPrice(currency: Token): Promise<Fraction | null> {
  const platform = COINGECK_PLATFORMS[currency.chainId as SupportedChainId]

  if (!platform) throw new Error('UnsupporedCoingeckoPlatformError')

  const params = {
    contract_addresses: currency.address,
    vs_currencies: VS_CURRENCY,
  }

  const url = `${BASE_URL}/${platform}?${new URLSearchParams(params)}`

  return fetchRateLimitted(url)
    .then((res) => {
      return res.json()
    })
    .catch((error) => {
      if (error.message.includes(FAILED_FETCH_ERROR)) {
        throw new CoingeckoRateLimitError()
      }

      return Promise.reject(error)
    })
    .then((res: CoinGeckoUsdQuote) => {
      const value = res[currency.address.toLowerCase()]?.usd

      // If coingecko API returns an empty response
      // It means Coingecko doesn't know about the currency
      if (value === undefined) {
        throw new CoingeckoUnknownCurrency()
      }

      return typeof value === 'number' ? FractionUtils.fromNumber(value) : null
    })
}
