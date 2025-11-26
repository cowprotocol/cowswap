import { BFF_BASE_URL } from '@cowprotocol/common-const'
import { FractionUtils } from '@cowprotocol/common-utils'
import { Fraction, Token } from '@uniswap/sdk-core'

import { t } from '@lingui/core/macro'
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

  try {
    const res = await fetchRateLimited(url)

    // Token not found
    if (res.status === 404) {
      const currencyAddress = currency.address
      const currencyChainId = currency.chainId

      throw new UnknownCurrencyError({
        cause: t`BFF did not return a price for '${currencyAddress}' on chain '${currencyChainId}'`,
      })
      // Unknown error case
    } else if (res.status !== 200) {
      const resStatus = res.status

      throw new Error(t`Unexpected response from BFF: ${resStatus}`)
    }

    const data: BffResponse = await res.json()

    // 200 response with error message
    if (isErrorResponse(data)) {
      const stringifiedData = JSON.stringify(data)

      throw new Error(t`Unexpected response from BFF: ${stringifiedData}`)
    }

    // Happy path
    return FractionUtils.fromNumber(data.price)
  } catch (error) {
    return Promise.reject(error)
  }
}

function isErrorResponse(response: BffResponse): response is BffUsdErrorResponse {
  return 'message' in response && !('price' in response)
}
