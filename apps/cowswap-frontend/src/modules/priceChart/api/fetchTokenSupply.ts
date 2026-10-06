import { BFF_BASE_URL } from '@cowprotocol/common-const'
import { fetchWithTimeout, getWrappedToken } from '@cowprotocol/common-utils'
import { getAddressKey, isSupportedChain } from '@cowprotocol/cow-sdk'
import type { Currency } from '@cowprotocol/currency'

import { PRICE_CHART_TIMEOUT } from '../lib/priceChart.constants'

interface TokenSupplyResponse {
  circulatingSupply: number | null
  totalSupply: number | null
}

export async function fetchTokenSupply(currency: Currency): Promise<TokenSupplyResponse> {
  const { chainId } = currency
  if (!isSupportedChain(chainId)) throw new Error(`Unsupported price chart chain: ${chainId}`)

  const address = getAddressKey(getWrappedToken(currency).address)
  const response = await fetchWithTimeout(`${BFF_BASE_URL}/${chainId}/tokens/${address}/supply`, {
    headers: { Accept: 'application/json' },
    timeout: PRICE_CHART_TIMEOUT,
    timeoutMessage: 'Token supply request timed out',
  })

  if (!response.ok) {
    throw new Error(`Token supply request failed with status ${response.status}`)
  }

  return (await response.json()) as TokenSupplyResponse
}
