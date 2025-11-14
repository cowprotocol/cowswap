/* eslint-disable @typescript-eslint/no-explicit-any */

// Mock modules that require window before imports
jest.mock('@cowprotocol/common-utils', () => ({
  ...jest.requireActual('@cowprotocol/common-utils'),
  getCurrentChainIdFromUrl: jest.fn().mockReturnValue(1),
  onlyResolvesLast: jest.fn().mockImplementation((fn) => {
    return async (...args: any[]) => {
      const result = await fn(...args)
      // If the function already returns a CancelableResult format, return as-is
      if (result && typeof result === 'object' && 'cancelled' in result) {
        return result
      }
      // Otherwise wrap in CancelableResult format
      return { cancelled: false, data: result }
    }
  }),
}))

jest.mock('cowSdk', () => ({
  orderBookApi: {},
}))

jest.mock('tradingSdk/bridgingSdk', () => ({
  bridgingSdk: {
    getQuote: jest.fn(),
    getBestQuote: jest.fn(),
  },
}))

import { onlyResolvesLast } from '@cowprotocol/common-utils'
import { OrderKind, PriceQuality, SupportedChainId } from '@cowprotocol/cow-sdk'
import {
  BridgeProviderError,
  BridgeProviderQuoteError,
  BridgeQuoteAndPost,
  BridgeQuoteErrors,
  BridgeQuoteResults,
  MultiQuoteResult,
  QuoteBridgeRequest,
} from '@cowprotocol/sdk-bridging'
import { QuoteAndPost } from '@cowprotocol/sdk-trading'

import { bridgingSdk } from 'tradingSdk/bridgingSdk'

import { mapOperatorErrorToQuoteError, QuoteApiError, QuoteApiErrorCodes } from 'api/cowProtocol/errors/QuoteError'
import { getIsOrderBookTypedError } from 'api/cowProtocol/getIsOrderBookTypedError'

import { fetchAndProcessQuote } from './fetchAndProcessQuote'

import { TradeQuoteManager } from '../hooks/useTradeQuoteManager'
import { TradeQuoteFetchParams, TradeQuotePollingParameters } from '../types'
import { getBridgeQuoteSigner } from '../utils/getBridgeQuoteSigner'

// Mock dependencies
jest.mock('../utils/getBridgeQuoteSigner', () => ({
  getBridgeQuoteSigner: jest.fn(),
}))

jest.mock('api/cowProtocol/getIsOrderBookTypedError', () => ({
  getIsOrderBookTypedError: jest.fn(),
}))

jest.mock('api/cowProtocol/errors/QuoteError', () => ({
  ...jest.requireActual('api/cowProtocol/errors/QuoteError'),
  mapOperatorErrorToQuoteError: jest.fn(),
}))

// Mock console.error to avoid noise in tests
jest.spyOn(console, 'error').mockImplementation(() => {})

const tradeQuotePollingParameters: TradeQuotePollingParameters = {
  isConfirmOpen: false,
  isQuoteUpdatePossible: true,
  useSuggestedSlippageApi: false,
}

const mockTimings = {
  now: Date.now(),
  ref: { current: Date.now() },
}

// eslint-disable-next-line max-lines-per-function
describe('fetchAndProcessQuote', () => {
  let mockTradeQuoteManager: jest.Mocked<TradeQuoteManager>
  let mockBridgingSdk: jest.Mocked<typeof bridgingSdk>
  let mockGetBridgeQuoteSigner: jest.MockedFunction<typeof getBridgeQuoteSigner>
  let mockGetIsOrderBookTypedError: jest.MockedFunction<typeof getIsOrderBookTypedError>
  let mockMapOperatorErrorToQuoteError: jest.MockedFunction<typeof mapOperatorErrorToQuoteError>
  let mockOnlyResolvesLast: jest.MockedFunction<typeof onlyResolvesLast>

  const mockFetchParams: TradeQuoteFetchParams = {
    hasParamsChanged: true,
    priceQuality: PriceQuality.FAST,
    fetchStartTimestamp: Date.now(),
  }

  const mockQuoteParams: QuoteBridgeRequest = {
    kind: OrderKind.SELL,
    amount: BigInt('1000000000000000000'),
    owner: '0x1234567890123456789012345678901234567890' as `0x${string}`,
    sellTokenChainId: SupportedChainId.MAINNET,
    sellTokenAddress: '0xA0b86a33E6441E3bbC44Bd264B41a30AD5D3B1c6',
    sellTokenDecimals: 18,
    buyTokenChainId: SupportedChainId.MAINNET,
    buyTokenAddress: '0xC02aaA39b223FE8D0A0e5C4F27ead9083C756Cc2',
    buyTokenDecimals: 18,
    account: '0x1234567890123456789012345678901234567890' as `0x${string}`,
    appCode: 'test',
    signer: {} as jest.Mocked<any>,
    receiver: '0x1234567890123456789012345678901234567890',
    validFor: 3600,
  }

  const mockAppData = {
    appCode: 'test',
    environment: 'prod' as const,
    metadata: {},
    version: '1.0.0',
  }

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks()

    // Setup mock implementations
    mockTradeQuoteManager = {
      setLoading: jest.fn(),
      reset: jest.fn(),
      onError: jest.fn(),
      onResponse: jest.fn(),
    }

    mockBridgingSdk = bridgingSdk as jest.Mocked<typeof bridgingSdk>
    mockGetBridgeQuoteSigner = getBridgeQuoteSigner as jest.MockedFunction<typeof getBridgeQuoteSigner>
    mockGetIsOrderBookTypedError = getIsOrderBookTypedError as jest.MockedFunction<typeof getIsOrderBookTypedError>
    mockMapOperatorErrorToQuoteError = mapOperatorErrorToQuoteError as jest.MockedFunction<
      typeof mapOperatorErrorToQuoteError
    >
    mockOnlyResolvesLast = onlyResolvesLast as jest.MockedFunction<typeof onlyResolvesLast>

    mockGetBridgeQuoteSigner.mockReturnValue({} as jest.Mocked<any>)
    mockGetIsOrderBookTypedError.mockReturnValue(false)
    mockMapOperatorErrorToQuoteError.mockReturnValue({
      errorType: QuoteApiErrorCodes.UNHANDLED_ERROR,
      description: 'Test error',
    })
  })

  describe('Main fetchAndProcessQuote function', () => {
    it('should set loading state and call fetchSwapQuote for same-chain swaps', async () => {
      const sameChainQuoteParams = {
        ...mockQuoteParams,
        buyTokenChainId: SupportedChainId.MAINNET, // Same as sellTokenChainId
      }

      const mockQuoteAndPost: QuoteAndPost = {
        quoteResults: {} as any,
        postSwapOrderFromQuote: jest.fn(),
      }

      mockBridgingSdk.getQuote.mockResolvedValue({
        cancelled: false,
        data: mockQuoteAndPost,
      } as any)

      await fetchAndProcessQuote(
        mockFetchParams,
        sameChainQuoteParams,
        tradeQuotePollingParameters,
        mockAppData,
        mockTradeQuoteManager,
        mockTimings,
      )

      expect(mockTradeQuoteManager.setLoading).toHaveBeenCalledWith(true)
      expect(mockBridgingSdk.getQuote).toHaveBeenCalledWith(sameChainQuoteParams, {
        quoteRequest: {
          priceQuality: PriceQuality.FAST,
        },
        appData: mockAppData,
        quoteSigner: undefined,
      })
      expect(mockTradeQuoteManager.onResponse).toHaveBeenCalledWith(mockQuoteAndPost, null, mockFetchParams)
    })

    it('should set loading state and call fetchBridgingQuote for cross-chain swaps', async () => {
      const crossChainQuoteParams = {
        ...mockQuoteParams,
        sellTokenChainId: SupportedChainId.MAINNET,
        buyTokenChainId: SupportedChainId.GNOSIS_CHAIN,
      }

      const mockResult: MultiQuoteResult = {
        providerDappId: 'test-provider',
        quote: null,
      }

      mockBridgingSdk.getBestQuote.mockResolvedValue(mockResult)

      await fetchAndProcessQuote(
        mockFetchParams,
        crossChainQuoteParams,
        tradeQuotePollingParameters,
        mockAppData,
        mockTradeQuoteManager,
        mockTimings,
      )

      expect(mockTradeQuoteManager.setLoading).toHaveBeenCalledWith(true)
      expect(mockGetBridgeQuoteSigner).toHaveBeenCalledWith(SupportedChainId.MAINNET)
      expect(mockBridgingSdk.getBestQuote).toHaveBeenCalledWith({
        quoteBridgeRequest: crossChainQuoteParams,
        advancedSettings: {
          quoteRequest: {
            priceQuality: PriceQuality.FAST,
          },
          appData: mockAppData,
          quoteSigner: {},
        },
        options: {
          onQuoteResult: expect.any(Function),
        },
      })
    })

    it('should use optimal quote for OPTIMAL price quality', async () => {
      const optimalFetchParams = {
        ...mockFetchParams,
        priceQuality: PriceQuality.OPTIMAL,
      }

      const mockQuoteAndPost: QuoteAndPost = {
        quoteResults: {} as any,
        postSwapOrderFromQuote: jest.fn(),
      }

      mockBridgingSdk.getQuote.mockResolvedValue({
        cancelled: false,
        data: mockQuoteAndPost,
      } as any)

      await fetchAndProcessQuote(
        optimalFetchParams,
        mockQuoteParams,
        tradeQuotePollingParameters,
        mockAppData,
        mockTradeQuoteManager,
        mockTimings,
      )

      expect(mockBridgingSdk.getQuote).toHaveBeenCalledWith(mockQuoteParams, {
        quoteRequest: {
          priceQuality: PriceQuality.OPTIMAL,
        },
        appData: mockAppData,
        quoteSigner: undefined,
      })
    })
  })

  describe('fetchSwapQuote', () => {
    beforeEach(() => {
      const mockQuoteAndPost: QuoteAndPost = {
        quoteResults: {} as any,
        postSwapOrderFromQuote: jest.fn(),
      }

      mockBridgingSdk.getQuote.mockResolvedValue({
        cancelled: false,
        data: mockQuoteAndPost,
      } as any)
    })

    it('should handle successful quote response', async () => {
      const mockQuoteAndPost: QuoteAndPost = {
        quoteResults: {} as any,
        postSwapOrderFromQuote: jest.fn(),
      }

      mockBridgingSdk.getQuote.mockResolvedValue({
        cancelled: false,
        data: mockQuoteAndPost,
      } as any)

      await fetchAndProcessQuote(
        mockFetchParams,
        mockQuoteParams,
        tradeQuotePollingParameters,
        mockAppData,
        mockTradeQuoteManager,
        mockTimings,
      )

      expect(mockTradeQuoteManager.onResponse).toHaveBeenCalledWith(mockQuoteAndPost, null, mockFetchParams)
    })

    it('should handle cancelled request', async () => {
      mockBridgingSdk.getQuote.mockResolvedValue({
        cancelled: true,
        data: null,
      } as any)

      await fetchAndProcessQuote(
        mockFetchParams,
        mockQuoteParams,
        tradeQuotePollingParameters,
        mockAppData,
        mockTradeQuoteManager,
        mockTimings,
      )

      expect(mockTradeQuoteManager.onResponse).not.toHaveBeenCalled()
      expect(mockTradeQuoteManager.onError).not.toHaveBeenCalled()
    })

    it('should handle QuoteApiError', async () => {
      const mockError = new Error('API Error')

      mockBridgingSdk.getQuote.mockRejectedValue(mockError)
      mockGetIsOrderBookTypedError.mockReturnValue(true)
      mockMapOperatorErrorToQuoteError.mockReturnValue({
        errorType: QuoteApiErrorCodes.UnsupportedToken,
        description: 'Unsupported token',
      })

      await fetchAndProcessQuote(
        mockFetchParams,
        mockQuoteParams,
        tradeQuotePollingParameters,
        mockAppData,
        mockTradeQuoteManager,
        mockTimings,
      )

      expect(mockTradeQuoteManager.onError).toHaveBeenCalledWith(
        expect.any(QuoteApiError),
        SupportedChainId.MAINNET,
        mockQuoteParams,
        mockFetchParams,
      )
    })

    it('should handle generic error', async () => {
      const mockError = new Error('Generic error')

      mockBridgingSdk.getQuote.mockRejectedValue(mockError)
      mockGetIsOrderBookTypedError.mockReturnValue(false)

      await fetchAndProcessQuote(
        mockFetchParams,
        mockQuoteParams,
        tradeQuotePollingParameters,
        mockAppData,
        mockTradeQuoteManager,
        mockTimings,
      )

      // Should call onError for generic errors in swap quotes
      expect(mockTradeQuoteManager.onError).toHaveBeenCalled()
      expect(console.error).toHaveBeenCalledWith('[fetchAndProcessQuote]:: fetchQuote error', mockError)
    })
  })

  describe('fetchBridgingQuote', () => {
    const crossChainQuoteParams = {
      ...mockQuoteParams,
      sellTokenChainId: SupportedChainId.MAINNET,
      buyTokenChainId: SupportedChainId.GNOSIS_CHAIN,
    }

    it('should handle successful bridge quote with onQuoteResult callback', async () => {
      const mockBridgeQuote: BridgeQuoteResults = {
        providerInfo: { name: 'Test Provider', logoUrl: '', dappId: 'test', website: '', type: 'HookBridgeProvider' },
        tradeParameters: crossChainQuoteParams,
        bridgeCallDetails: {} as any,
        amountsAndCosts: {} as any,
        quoteTimestamp: Date.now(),
        fees: { bridgeFee: BigInt(0), destinationGasFee: BigInt(0) },
        limits: { minDeposit: BigInt(0), maxDeposit: BigInt(0) },
        isSell: true,
        expectedFillTimeSeconds: 300,
      }

      const mockQuoteAndPost: BridgeQuoteAndPost = {
        swap: {} as any,
        bridge: mockBridgeQuote,
        postSwapOrderFromQuote: jest.fn(),
      }

      const mockResult: MultiQuoteResult = {
        providerDappId: 'test-provider',
        quote: mockQuoteAndPost,
      }

      let onQuoteResultCallback: ((result: MultiQuoteResult) => void) | undefined

      mockBridgingSdk.getBestQuote.mockImplementation(async (request) => {
        onQuoteResultCallback = request.options?.onQuoteResult
        return mockResult
      })

      await fetchAndProcessQuote(
        mockFetchParams,
        crossChainQuoteParams,
        tradeQuotePollingParameters,
        mockAppData,
        mockTradeQuoteManager,
        mockTimings,
      )

      // Simulate the callback being called
      if (onQuoteResultCallback) {
        onQuoteResultCallback(mockResult)
      }

      expect(mockTradeQuoteManager.onResponse).toHaveBeenCalledWith(
        {
          quoteResults: mockQuoteAndPost.swap,
          postSwapOrderFromQuote: mockQuoteAndPost.postSwapOrderFromQuote,
        },
        mockBridgeQuote,
        mockFetchParams,
      )
    })

    it('should handle BridgeProviderQuoteError', async () => {
      const mockBridgeError = new BridgeProviderQuoteError(BridgeQuoteErrors.API_ERROR, { context: 'test' })
      const mockResult: MultiQuoteResult = {
        providerDappId: 'test-provider',
        quote: null,
        error: mockBridgeError,
      }

      mockBridgingSdk.getBestQuote.mockResolvedValue(mockResult)

      await fetchAndProcessQuote(
        mockFetchParams,
        crossChainQuoteParams,
        tradeQuotePollingParameters,
        mockAppData,
        mockTradeQuoteManager,
        mockTimings,
      )

      expect(mockTradeQuoteManager.onError).toHaveBeenCalledWith(
        mockBridgeError,
        SupportedChainId.MAINNET,
        crossChainQuoteParams,
        mockFetchParams,
      )
    })

    it('should handle generic error in bridge result', async () => {
      const mockGenericError = new BridgeProviderError('Generic bridge error', { context: 'test' })
      const mockResult: MultiQuoteResult = {
        providerDappId: 'test-provider',
        quote: null,
        error: mockGenericError,
      }

      mockBridgingSdk.getBestQuote.mockResolvedValue(mockResult)

      await fetchAndProcessQuote(
        mockFetchParams,
        crossChainQuoteParams,
        tradeQuotePollingParameters,
        mockAppData,
        mockTradeQuoteManager,
        mockTimings,
      )

      expect(console.error).toHaveBeenCalledWith('[fetchAndProcessQuote]:: fetchQuote error', mockGenericError)
    })

    it('should handle null result', async () => {
      mockBridgingSdk.getBestQuote.mockResolvedValue(null)

      await fetchAndProcessQuote(
        mockFetchParams,
        crossChainQuoteParams,
        tradeQuotePollingParameters,
        mockAppData,
        mockTradeQuoteManager,
        mockTimings,
      )

      // Should not call any manager methods for null result
      expect(mockTradeQuoteManager.onError).not.toHaveBeenCalled()
      expect(mockTradeQuoteManager.onResponse).not.toHaveBeenCalled()
    })

    it('should handle unexpected exception in getBestQuote', async () => {
      const unexpectedError = new Error('Unexpected error')
      mockBridgingSdk.getBestQuote.mockRejectedValue(unexpectedError)

      await fetchAndProcessQuote(
        mockFetchParams,
        crossChainQuoteParams,
        tradeQuotePollingParameters,
        mockAppData,
        mockTradeQuoteManager,
        mockTimings,
      )

      expect(console.error).toHaveBeenCalledWith('[fetchAndProcessQuote]:: unexpected bridge error', unexpectedError)
    })

    it('should not call onResponse when quote is null in onQuoteResult callback', async () => {
      const mockResult: MultiQuoteResult = {
        providerDappId: 'test-provider',
        quote: null,
      }

      let onQuoteResultCallback: ((result: MultiQuoteResult) => void) | undefined

      mockBridgingSdk.getBestQuote.mockImplementation(async (request) => {
        onQuoteResultCallback = request.options?.onQuoteResult
        return mockResult
      })

      await fetchAndProcessQuote(
        mockFetchParams,
        crossChainQuoteParams,
        tradeQuotePollingParameters,
        mockAppData,
        mockTradeQuoteManager,
        mockTimings,
      )

      // Simulate the callback being called with null quote
      if (onQuoteResultCallback) {
        onQuoteResultCallback(mockResult)
      }

      expect(mockTradeQuoteManager.onResponse).not.toHaveBeenCalled()
    })

    it('should handle request cancellation in getBestQuote', async () => {
      const mockResult: MultiQuoteResult = {
        providerDappId: 'test-provider',
        quote: null,
      }

      mockBridgingSdk.getBestQuote.mockResolvedValue(mockResult)

      // Override onlyResolvesLast to return cancelled for this test
      mockOnlyResolvesLast.mockImplementation((fn: any) => {
        return async (...args: any[]) => {
          const data = await fn(...args)
          return { cancelled: true, data }
        }
      })

      await fetchAndProcessQuote(
        mockFetchParams,
        crossChainQuoteParams,
        tradeQuotePollingParameters,
        mockAppData,
        mockTradeQuoteManager,
        mockTimings,
      )

      // Should not call any manager methods when request is cancelled
      expect(mockTradeQuoteManager.onError).not.toHaveBeenCalled()
      expect(mockTradeQuoteManager.onResponse).not.toHaveBeenCalled()
    })
  })

  describe('parseError function', () => {
    it('should return QuoteApiError for order book typed errors', async () => {
      const mockError = new Error('Order book error')
      const mockErrorBody = {
        errorType: QuoteApiErrorCodes.UnsupportedToken,
        description: 'Unsupported token',
      }

      // Mock the error to have a body property
      ;(mockError as any).body = mockErrorBody

      mockBridgingSdk.getQuote.mockRejectedValue(mockError)
      mockGetIsOrderBookTypedError.mockReturnValue(true)
      mockMapOperatorErrorToQuoteError.mockReturnValue(mockErrorBody)

      await fetchAndProcessQuote(
        mockFetchParams,
        mockQuoteParams,
        tradeQuotePollingParameters,
        mockAppData,
        mockTradeQuoteManager,
        mockTimings,
      )

      expect(mockMapOperatorErrorToQuoteError).toHaveBeenCalledWith(mockErrorBody)
      expect(mockTradeQuoteManager.onError).toHaveBeenCalledWith(
        expect.any(QuoteApiError),
        SupportedChainId.MAINNET,
        mockQuoteParams,
        mockFetchParams,
      )
    })

    it('should return original error for non-order book errors', async () => {
      const mockError = new Error('Generic error')

      mockBridgingSdk.getQuote.mockRejectedValue(mockError)
      mockGetIsOrderBookTypedError.mockReturnValue(false)

      await fetchAndProcessQuote(
        mockFetchParams,
        mockQuoteParams,
        tradeQuotePollingParameters,
        mockAppData,
        mockTradeQuoteManager,
        mockTimings,
      )

      expect(mockMapOperatorErrorToQuoteError).not.toHaveBeenCalled()
      expect(mockTradeQuoteManager.onError).toHaveBeenCalled()
      expect(console.error).toHaveBeenCalledWith('[fetchAndProcessQuote]:: fetchQuote error', mockError)
    })
  })

  describe('Edge cases', () => {
    it('should handle undefined appData', async () => {
      const mockQuoteAndPost: QuoteAndPost = {
        quoteResults: {} as any,
        postSwapOrderFromQuote: jest.fn(),
      }

      mockBridgingSdk.getQuote.mockResolvedValue({
        cancelled: false,
        data: mockQuoteAndPost,
      } as any)

      await fetchAndProcessQuote(
        mockFetchParams,
        mockQuoteParams,
        tradeQuotePollingParameters,
        undefined,
        mockTradeQuoteManager,
        mockTimings,
      )

      expect(mockBridgingSdk.getQuote).toHaveBeenCalledWith(mockQuoteParams, {
        quoteRequest: {
          priceQuality: PriceQuality.FAST,
        },
        appData: undefined,
        quoteSigner: undefined,
      })
    })

    it('should handle hasParamsChanged = false', async () => {
      const noParamsChangedFetchParams = {
        ...mockFetchParams,
        hasParamsChanged: false,
      }

      const mockQuoteAndPost: QuoteAndPost = {
        quoteResults: {} as any,
        postSwapOrderFromQuote: jest.fn(),
      }

      mockBridgingSdk.getQuote.mockResolvedValue({
        cancelled: false,
        data: mockQuoteAndPost,
      } as any)

      await fetchAndProcessQuote(
        noParamsChangedFetchParams,
        mockQuoteParams,
        tradeQuotePollingParameters,
        mockAppData,
        mockTradeQuoteManager,
        mockTimings,
      )

      expect(mockTradeQuoteManager.setLoading).toHaveBeenCalledWith(false)
    })
  })
})
