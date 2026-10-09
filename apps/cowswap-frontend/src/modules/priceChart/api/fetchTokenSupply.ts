import { BFF_BASE_URL } from '@cowprotocol/common-const'
import { fetchWithTimeout, getCurrencyAddress, normalizeError } from '@cowprotocol/common-utils'
import { getAddressKey, isSupportedChain } from '@cowprotocol/cow-sdk'
import type { Currency } from '@cowprotocol/currency'

import { PRICE_CHART_TIMEOUT } from '../lib/priceChart.constants'
import { logPriceChart } from '../lib/priceChart.utils'

interface TokenSupplyResponse {
  circulatingSupply: number | null
  totalSupply: number | null
}

export async function fetchTokenSupply(currency: Currency): Promise<TokenSupplyResponse> {
  const { chainId } = currency
  if (!isSupportedChain(chainId)) throw new Error(`Unsupported price chart chain: ${chainId}`)

  const address = getAddressKey(getCurrencyAddress(currency))
  logPriceChart.debug('Fetching token supply', { address, chainId })

  try {
    const response = await fetchWithTimeout(`${BFF_BASE_URL}/${chainId}/tokens/${address}/supply`, {
      headers: { Accept: 'application/json' },
      timeout: PRICE_CHART_TIMEOUT,
      timeoutMessage: 'Token supply request timed out',
    })

    if (!response.ok) {
      throw new Error(`Token supply request failed with status ${response.status}`)
    }

    const supply = (await response.json()) as TokenSupplyResponse
    logPriceChart.info('Fetched token supply', { address, chainId, ...supply })
    return supply
  } catch (err: unknown) {
    const error = normalizeError(err)
    logPriceChart.warn('Failed to fetch token supply', error, { address, chainId })
    throw error
  }
}
