import { BFF_BASE_URL } from '@cowprotocol/common-const'
import { fetchWithTimeout } from '@cowprotocol/common-utils'

import { PRICE_CHART_TIMEOUT } from '../lib/priceChart.constants'

import type { PriceChartAssetDescriptor } from '../lib/tradingView.types'

interface TokenSupplyResponse {
  circulatingSupply: number | null
  totalSupply: number | null
}

export async function fetchTokenSupply(asset: PriceChartAssetDescriptor): Promise<TokenSupplyResponse> {
  const response = await fetchWithTimeout(`${BFF_BASE_URL}/${asset.chainId}/tokens/${asset.address}/supply`, {
    headers: { Accept: 'application/json' },
    timeout: PRICE_CHART_TIMEOUT,
    timeoutMessage: 'Token supply request timed out',
  })

  if (!response.ok) {
    throw new Error(`Token supply request failed with status ${response.status}`)
  }

  return (await response.json()) as TokenSupplyResponse
}
