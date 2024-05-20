import { FractionUtils } from '@cowprotocol/common-utils'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { Fraction, Token } from '@uniswap/sdk-core'

import ms from 'ms.macro'

import { fetchWithRateLimit } from 'common/utils/fetch'

import { RateLimitError, UnknownCurrencyError, UnsupportedPlatformError } from './errors'

type SuccessCoingeckoUsdQuoteResponse = {
  [address: string]: {
    usd: number
  }
}
type ErrorCoingeckoResponse = { status: { error_code: number; error_message: string } }

export const COINGECKO_PLATFORMS: Record<SupportedChainId, string | null> = {
  [SupportedChainId.MAINNET]: 'ethereum',
  [SupportedChainId.GNOSIS_CHAIN]: 'xdai',
  [SupportedChainId.SEPOLIA]: null,
}

const BASE_URL = 'https://cow-web-services.vercel.app/api/serverless/proxies/coingecko'
const VS_CURRENCY = 'usd'
/**
 * This is a text of 429 HTTP code
 * https://saturncloud.io/blog/catching-javascript-fetch-failing-with-cloudflare-429-missing-cors-header/
 */
const FAILED_FETCH_ERROR = 'Failed to fetch'

const fetchRateLimited = fetchWithRateLimit({
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

export async function getCoingeckoUsdPrice(currency: Token): Promise<Fraction | null> {
  const platform = COINGECKO_PLATFORMS[currency.chainId as SupportedChainId]

  if (!platform) throw new UnsupportedPlatformError({ cause: `Coingecko does not support chain '${currency.chainId}'` })

  const params = {
    contract_addresses: currency.address,
    vs_currencies: VS_CURRENCY,
  }

  const url = `${BASE_URL}/simple/token_price/${platform}?${new URLSearchParams(params)}`

  return fetchRateLimited(url)
    .then((res) => res.json())
    .catch((error) => {
      if (error.message.includes(FAILED_FETCH_ERROR)) {
        throw new RateLimitError({ cause: error })
      }

      return Promise.reject(error)
    })
    .then((res: SuccessCoingeckoUsdQuoteResponse | ErrorCoingeckoResponse) => {
      if (isErrorResponse(res)) {
        if (res.status.error_code === 429) {
          throw new RateLimitError({ cause: res })
        } else {
          throw new Error(res.status.error_message, { cause: res })
        }
      }

      const value = res[currency.address.toLowerCase()]?.usd

      // If coingecko API returns an empty response
      // It means Coingecko doesn't know about the currency
      if (value === undefined) {
        throw new UnknownCurrencyError({
          cause: `Coingecko did not return a price for '${currency.address}' on chain '${currency.chainId}'`,
        })
      }

      return FractionUtils.fromNumber(value)
    })
}

function isErrorResponse(
  res: SuccessCoingeckoUsdQuoteResponse | ErrorCoingeckoResponse
): res is ErrorCoingeckoResponse {
  return 'status' in res
}
