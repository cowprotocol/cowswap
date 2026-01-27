import { SlippageToleranceRequest, SlippageToleranceResponse } from '@cowprotocol/cow-sdk'

const DEFAULT_TIMEOUT = 2000 // 2 sec

const EMPTY_SLIPPAGE_RESPONSE = { slippageBps: null }

const log = console.debug

export class CoWBFFClient {
  constructor(private readonly baseUrl: string) {}

  /**
   * Fetches slippage tolerance from the API for a given token pair
   * @param sellToken - Address of the token to sell (e.g., '0x6b175474e89094c44da98b954eedeac495271d0f')
   * @param buyToken - Address of the token to buy (e.g., '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599')
   * @param chainId - Chain ID for the API request
   * @returns Promise<SlippageToleranceResponse | null> - Returns null if API call fails
   */
  async getSlippageTolerance({
    sellToken,
    buyToken,
    chainId,
  }: SlippageToleranceRequest): Promise<SlippageToleranceResponse> {
    try {
      const url = `${this.baseUrl}/${chainId}/markets/${sellToken}-${buyToken}/slippageTolerance`

      log(`Fetching slippage tolerance from API: ${url} (timeout: ${DEFAULT_TIMEOUT}ms)`)

      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT)

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        log(`Slippage tolerance API error: ${response.status} ${response.statusText}`)
        return EMPTY_SLIPPAGE_RESPONSE
      }

      const data = await response.json()

      // Validate response structure
      if (typeof data !== 'object' || data === null || typeof data.slippageBps !== 'number') {
        log('Invalid slippage tolerance API response structure')
        return EMPTY_SLIPPAGE_RESPONSE
      }

      log(`Retrieved slippage tolerance from API: ${data.slippageBps} BPS`)
      return { slippageBps: data.slippageBps }
    } catch (error) {
      log(`Failed to fetch slippage tolerance from API: ${error instanceof Error ? error.message : 'Unknown error'}`)
      return EMPTY_SLIPPAGE_RESPONSE
    }
  }
}
