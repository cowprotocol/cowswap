import { GAS_FEE_ENDPOINTS } from '@cowprotocol/common-const'
import { isEvmChain, SupportedChainId as ChainId } from '@cowprotocol/cow-sdk'
import { reownWagmiConfig } from '@cowprotocol/wallet'

import { getGasPrice } from '@wagmi/core'

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

type GasPrices = Omit<GasFeeEndpointResponse, 'lastUpdate'>

// The Blockscout gas price oracle returns prices (floats in gwei) for these confidence levels
const PRICE_KEYS: Array<keyof GasPrices> = ['fast', 'average', 'slow']

class GasFeeApi {
  getUrl(chainId: ChainId): string {
    return GAS_FEE_ENDPOINTS[chainId]
  }

  supportedChain(chainId: ChainId): boolean {
    // Gas prices come either from the Blockscout oracle or, as a fallback, from the
    // eth_gasPrice RPC method - both of which only apply to EVM chains.
    return isEvmChain(chainId)
  }

  toWei(input: number | null): string | null {
    if (!input) {
      return null
    }

    return Math.floor(input * ONE_GWEI).toString()
  }

  // Parse data from the Blockscout gas price oracle, e.g. { "slow": 0.16, "average": 0.44, "fast": 2.06 }
  parseData(json: Record<keyof GasPrices, number>): GasFeeEndpointResponse {
    const output: GasFeeEndpointResponse = {
      lastUpdate: new Date().toISOString(),
      fast: null,
      average: null,
      slow: null,
    }

    for (const key of PRICE_KEYS) {
      output[key] = this.toWei(json[key])
    }

    return output
  }

  async fetchData(url: string): Promise<Record<keyof GasPrices, number>> {
    const response = await fetchRateLimited(url)

    return response.json()
  }

  // Fallback used when there is no gas price oracle endpoint for the network,
  // or when the request to it failed. Returns the same value for all confidence levels.
  async getGasPriceFromRpc(chainId: ChainId): Promise<GasFeeEndpointResponse> {
    const gasPrice = (await getGasPrice(reownWagmiConfig, { chainId })).toString()

    return {
      lastUpdate: new Date().toISOString(),
      fast: gasPrice,
      average: gasPrice,
      slow: gasPrice,
    }
  }

  async getGasPrices(chainId: ChainId = ChainId.MAINNET): Promise<GasFeeEndpointResponse> {
    const url = this.getUrl(chainId)

    if (url) {
      try {
        const data = await this.fetchData(url)

        return this.parseData(data)
      } catch (error) {
        console.error('[gasFeeApi] Failed to fetch gas prices from the oracle, falling back to RPC', error)
      }
    }

    return this.getGasPriceFromRpc(chainId)
  }
}

export const gasFeeApi = new GasFeeApi()
