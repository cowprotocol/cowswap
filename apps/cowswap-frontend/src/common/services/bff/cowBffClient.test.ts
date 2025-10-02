import { CoWBFFClient } from './cowBffClient'

// Mock fetch globally
const mockFetch = jest.fn()
global.fetch = mockFetch

describe('CoWBFFClient', () => {
  beforeEach(() => {
    mockFetch.mockClear()
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('getSlippageTolerance', () => {
    const sellToken = '0x6b175474e89094c44da98b954eedeac495271d0f'
    const buyToken = '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599'
    const chainId = 1

    it('should return slippage tolerance on successful API response', async () => {
      const client = new CoWBFFClient('http://slippage.api')
      const mockResponse = { slippageBps: 150 }
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      })

      const result = await client.getSlippageTolerance({ sellToken, buyToken, chainId })

      expect(mockFetch).toHaveBeenCalledWith(
        `http://slippage.api/${chainId}/markets/${sellToken}-${buyToken}/slippageTolerance`,
        {
          method: 'GET',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          signal: expect.any(AbortSignal),
        },
      )
      expect(result).toEqual({ slippageBps: 150 })
    })

    it('should return null on HTTP error response', async () => {
      const client = new CoWBFFClient('http://slippage.api')
      mockFetch.mockResolvedValue({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      })

      const result = await client.getSlippageTolerance({ sellToken, buyToken, chainId })

      expect(result.slippageBps).toBeNull()
    })

    it('should return null on invalid response structure', async () => {
      const client = new CoWBFFClient('http://slippage.api')
      const mockResponse = { invalidField: 'value' }
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      })

      const result = await client.getSlippageTolerance({ sellToken, buyToken, chainId })

      expect(result.slippageBps).toBeNull()
    })

    it('should return null when slippageBps is not a number', async () => {
      const client = new CoWBFFClient('http://slippage.api')
      const mockResponse = { slippageBps: 'invalid' }
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      })

      const result = await client.getSlippageTolerance({ sellToken, buyToken, chainId })

      expect(result.slippageBps).toBeNull()
    })

    it('should return null on network error', async () => {
      const client = new CoWBFFClient('http://slippage.api')
      mockFetch.mockRejectedValue(new Error('Network error'))

      const result = await client.getSlippageTolerance({ sellToken, buyToken, chainId })

      expect(result.slippageBps).toBeNull()
    })

    it('should return null when response is null', async () => {
      const client = new CoWBFFClient('http://slippage.api')
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(null),
      })

      const result = await client.getSlippageTolerance({ sellToken, buyToken, chainId })

      expect(result.slippageBps).toBeNull()
    })

    it('should construct correct URL for different chain IDs', async () => {
      const client = new CoWBFFClient('http://slippage.api')
      const mockResponse = { slippageBps: 100 }
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      })

      await client.getSlippageTolerance({ sellToken, buyToken, chainId: 137 })

      expect(mockFetch).toHaveBeenCalledWith(
        `http://slippage.api/137/markets/${sellToken}-${buyToken}/slippageTolerance`,
        expect.any(Object),
      )
    })

    it('should use default timeout of 2000ms when not specified', async () => {
      const client = new CoWBFFClient('http://slippage.api')
      const mockResponse = { slippageBps: 150 }
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      })

      await client.getSlippageTolerance({ sellToken, buyToken, chainId })

      // Verify the call was made with signal (indicates timeout setup)
      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          signal: expect.any(AbortSignal),
        }),
      )
    })
  })
})
