import { GAS_API_KEYS, GAS_FEE_ENDPOINTS } from '@cowprotocol/common-const'
import { SupportedChainId as ChainId } from '@cowprotocol/cow-sdk'

import { fetchWithRateLimit } from 'common/utils/fetch'

const fetchRateLimited = fetchWithRateLimit({
  rateLimit: {
    tokensPerInterval: 3,
    interval: 'second',
  },
})

// Values are returned as floats in gwei
const ONE_GWEI = 1_000_000_000

export type GasFeeEndpointResponse = {
  lastUpdate: string
  average: string | null
  fast: string | null
  slow: string | null
}

export interface EstimatedPrice {
  confidence: number
  price: number
  maxFeePerGas: number
  maxPriorityFeePerGas: number
}

type GasPrices = Omit<GasFeeEndpointResponse, 'lastUpdate'>

// Here the key is what we use in gas state and the value is confidence level
// coming from the Blockscout api, so we map state values with confidence lvls
const priceMap: GasPrices = {
  fast: '99',
  average: '90',
  slow: '70',
}

class GasFeeApi {
  getUrl(chainId: ChainId): string {
    return GAS_FEE_ENDPOINTS[chainId]
  }

  supportedChain(chainId: ChainId): boolean {
    return !!GAS_FEE_ENDPOINTS[chainId]
  }

  getHeaders(chainId: ChainId): { headers?: Headers } {
    // TODO: Replace any with proper type definitions
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const headers: { [key: string]: any } = {}
    const apiKey = GAS_API_KEYS[chainId]

    if (apiKey) {
      headers.headers = new Headers({
        Authorization: apiKey,
      })
    }

    return headers
  }

  toWei(input: number | null): string | null {
    if (!input) {
      return null
    }

    return Math.floor(input * ONE_GWEI).toString()
  }

  getBlocknativePrice(data: EstimatedPrice[], lvl: string | null): number | null {
    if (!data || !lvl) {
      return null
    }

    const price = data.find(({ confidence }: EstimatedPrice) => lvl === String(confidence))?.price

    return price || null
  }

  // TODO: Replace any with proper type definitions
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  parseData(json: any, chainId: ChainId): GasFeeEndpointResponse {
    const output: GasFeeEndpointResponse = {
      lastUpdate: new Date().toISOString(),
      fast: null,
      average: null,
      slow: null,
    }

    if (this.getUrl(chainId).match(/blocknative/)) {
      // Parse data from Blocknative
      const prices = json?.blockPrices[0]?.estimatedPrices

      if (prices) {
        for (const [key, value] of Object.entries(priceMap)) {
          const price = this.getBlocknativePrice(prices, value)
          output[key as keyof GasPrices] = this.toWei(price)
        }
      }
    } else {
      // Parse data from Blockscout
      for (const key of Object.keys(priceMap)) {
        output[key as keyof GasPrices] = this.toWei(json[key])
      }
    }

    return output
  }

  // TODO: Add proper return type annotation
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  async fetchData(chainId: ChainId) {
    const url = this.getUrl(chainId)
    const headers = this.getHeaders(chainId)
    const response = await fetchRateLimited(url, headers)

    return response.json()
  }

  async getGasPrices(chainId: ChainId = ChainId.MAINNET): Promise<GasFeeEndpointResponse> {
    const data = await this.fetchData(chainId)
    const parsed = this.parseData(data, chainId)

    return parsed
  }
}

export const gasFeeApi = new GasFeeApi()
