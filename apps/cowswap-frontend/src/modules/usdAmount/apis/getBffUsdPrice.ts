import { BFF_BASE_URL } from '@cowprotocol/common-const'
import { FractionUtils } from '@cowprotocol/common-utils'
import { Fraction, Token } from '@uniswap/sdk-core'

import ms from 'ms.macro'

import { fetchWithRateLimit } from 'common/utils/fetch'

import { UnknownCurrencyError } from './errors'

type BffUsdPriceResponse = {
  price: number
}
type BffUsdErrorResponse = { message: string }
type BffResponse = BffUsdPriceResponse | BffUsdErrorResponse

const fetchRateLimited = fetchWithRateLimit({
  // Allow 5 requests per second
  rateLimit: {
    tokensPerInterval: 5,
    interval: 'second',
  },
  // 2 retry attempts with 100ms delay
  backoff: {
    maxDelay: ms`0.1s`,
    numOfAttempts: 2,
  },
})

export async function getBffUsdPrice(currency: Token): Promise<Fraction | null> {
  const url = `${BFF_BASE_URL}/${currency.chainId}/tokens/${currency.address}/usdPrice`

  return fetchRateLimited(url)
    .then((res) => res.json())
    .catch((error) => {
      if (error.message === 'Price not found') {
        // TODO: will a 404 response be caught here?
        throw new UnknownCurrencyError({
          cause: `BFF did not return a price for '${currency.address}' on chain '${currency.chainId}'`,
        })
      }

      return Promise.reject(error)
    })
    .then((res: BffResponse) => {
      if (isErrorResponse(res)) {
        if (res.message === 'Price not found') {
          throw new UnknownCurrencyError({
            cause: `BFF did not return a price for '${currency.address}' on chain '${currency.chainId}'`,
          })
        }

        throw new Error(`Unexpected response from BFF: ${JSON.stringify(res)}`)
      }

      return FractionUtils.fromNumber(res.price)
    })
}

function isErrorResponse(response: BffResponse): response is BffUsdErrorResponse {
  return 'message' in response && !('price' in response)
}
