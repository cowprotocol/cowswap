import { DEFAULT_NETWORK_FOR_LISTS } from 'constants/lists'
import { SupportedChainId as ChainId } from '@cowprotocol/cow-sdk'
import { GAS_FEE_ENDPOINTS, GAS_API_KEYS } from 'constants/index'
import { fetchWithRateLimit } from '@cow/common/utils/fetch'

const fetchRateLimitted = fetchWithRateLimit({
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
    const baseUrl = GAS_FEE_ENDPOINTS[chainId]

    if (chainId !== ChainId.GNOSIS_CHAIN) {
      return `${baseUrl}?chainId=${chainId}`
    }

    return baseUrl
  }

  supportedChain(chainId: ChainId): boolean {
    return !!GAS_FEE_ENDPOINTS[chainId]
  }

  getHeaders(chainId: ChainId): { headers?: Headers } {
    const headers: { [key: string]: any } = {}
    const apiKey = GAS_API_KEYS[chainId] || ''

    if (chainId !== ChainId.GNOSIS_CHAIN) {
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

  parseData(json: any, chainId: ChainId): GasFeeEndpointResponse {
    const output: GasFeeEndpointResponse = {
      lastUpdate: new Date().toISOString(),
      fast: null,
      average: null,
      slow: null,
    }

    // Parse data for Gnosis chain (from Blockscout)
    if (chainId === ChainId.GNOSIS_CHAIN) {
      for (const key of Object.keys(priceMap)) {
        output[key as keyof GasPrices] = this.toWei(json[key])
      }
    } else {
      // Parse data for other chains (from Blocknative)
      const prices = json?.blockPrices[0]?.estimatedPrices

      if (prices) {
        for (const [key, value] of Object.entries(priceMap)) {
          const price = this.getBlocknativePrice(prices, value)
          output[key as keyof GasPrices] = this.toWei(price)
        }
      }
    }

    return output
  }

  async fetchData(chainId: ChainId) {
    const url = this.getUrl(chainId)
    const headers = this.getHeaders(chainId)
    const response = await fetchRateLimitted(url, headers)

    return response.json()
  }

  async getGasPrices(chainId: ChainId = DEFAULT_NETWORK_FOR_LISTS): Promise<GasFeeEndpointResponse> {
    const data = await this.fetchData(chainId)
    const parsed = this.parseData(data, chainId)

    return parsed
  }
}

export const gasFeeApi = new GasFeeApi()
