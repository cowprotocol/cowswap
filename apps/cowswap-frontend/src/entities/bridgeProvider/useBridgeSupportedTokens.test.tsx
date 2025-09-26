import React, { ReactNode } from 'react'

import { TokenWithLogo } from '@cowprotocol/common-const'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { BridgeProvider, BridgeQuoteResult, BuyTokensParams } from '@cowprotocol/sdk-bridging'

import { renderHook, waitFor } from '@testing-library/react'
import { SWRConfig } from 'swr'

import { useBridgeProviders } from './useBridgeProviders'
import { useBridgeSupportedTokens } from './useBridgeSupportedTokens'

jest.mock('@cowprotocol/common-hooks', () => ({
  useIsBridgingEnabled: jest.fn(),
}))

jest.mock('./useBridgeProviders', () => ({
  useBridgeProviders: jest.fn(),
}))

const { useIsBridgingEnabled } = require('@cowprotocol/common-hooks')

const mockUseBridgeProviders = useBridgeProviders as jest.MockedFunction<typeof useBridgeProviders>
const mockUseIsBridgingEnabled = useIsBridgingEnabled as jest.MockedFunction<typeof useIsBridgingEnabled>

// Mock console.error to avoid noise in tests
jest.spyOn(console, 'error').mockImplementation(() => {})

const mockProvider1: jest.Mocked<BridgeProvider<BridgeQuoteResult>> = {
  info: { dappId: 'provider1', name: 'Provider 1', logoUrl: '', website: '' },
  getBuyTokens: jest.fn(),
  getNetworks: jest.fn(),
  getIntermediateTokens: jest.fn(),
  getQuote: jest.fn(),
  getUnsignedBridgeCall: jest.fn(),
  getGasLimitEstimationForHook: jest.fn(),
  getSignedHook: jest.fn(),
  decodeBridgeHook: jest.fn(),
  getBridgingParams: jest.fn(),
  getExplorerUrl: jest.fn(),
  getStatus: jest.fn(),
  getCancelBridgingTx: jest.fn(),
  getRefundBridgingTx: jest.fn(),
}

const mockProvider2: jest.Mocked<BridgeProvider<BridgeQuoteResult>> = {
  info: { dappId: 'provider2', name: 'Provider 2', logoUrl: '', website: '' },
  getBuyTokens: jest.fn(),
  getNetworks: jest.fn(),
  getIntermediateTokens: jest.fn(),
  getQuote: jest.fn(),
  getUnsignedBridgeCall: jest.fn(),
  getGasLimitEstimationForHook: jest.fn(),
  getSignedHook: jest.fn(),
  decodeBridgeHook: jest.fn(),
  getBridgingParams: jest.fn(),
  getExplorerUrl: jest.fn(),
  getStatus: jest.fn(),
  getCancelBridgingTx: jest.fn(),
  getRefundBridgingTx: jest.fn(),
}

const mockTokens = [
  {
    address: '0x1111111111111111111111111111111111111111',
    name: 'Token A',
    symbol: 'TKNA',
    decimals: 18,
    chainId: 1,
    logoUrl: 'https://example.com/tokena.png',
  },
  {
    address: '0x2222222222222222222222222222222222222222',
    name: 'Token B',
    symbol: 'TKNB',
    decimals: 6,
    chainId: 1,
    logoUrl: 'https://example.com/tokenb.png',
  },
]

const mockBuyTokensParams: BuyTokensParams = {
  buyChainId: 1, // MAINNET
  sellChainId: SupportedChainId.ARBITRUM_ONE,
  sellTokenAddress: '0x1111111111111111111111111111111111111111',
}

const wrapper = ({ children }: { children: React.ReactNode }): ReactNode => {
  return <SWRConfig value={{ provider: () => new Map() }}>{children}</SWRConfig>
}

describe('useBridgeSupportedTokens', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUseIsBridgingEnabled.mockReturnValue(true)
    mockUseBridgeProviders.mockReturnValue([mockProvider1, mockProvider2])
  })

  afterEach(() => {
    jest.clearAllTimers()
  })

  it('should return null when bridging is disabled', async () => {
    mockUseIsBridgingEnabled.mockReturnValue(false)

    const { result } = renderHook(() => useBridgeSupportedTokens(mockBuyTokensParams), { wrapper })

    expect(result.current.data).toBeUndefined()
    expect(result.current.isLoading).toBe(false)
  })

  it('should return null when params are undefined', async () => {
    const { result } = renderHook(() => useBridgeSupportedTokens(undefined), { wrapper })

    await waitFor(() => {
      expect(result.current.data).toBe(null)
      expect(result.current.isLoading).toBe(false)
    })
  })

  it('should fetch and combine tokens from multiple providers', async () => {
    mockProvider1.getBuyTokens.mockResolvedValue({
      tokens: [mockTokens[0]],
      isRouteAvailable: true,
    })

    mockProvider2.getBuyTokens.mockResolvedValue({
      tokens: [mockTokens[1]],
      isRouteAvailable: true,
    })

    const { result } = renderHook(() => useBridgeSupportedTokens(mockBuyTokensParams), { wrapper })

    await waitFor(() => {
      expect(result.current.data).not.toBeNull()
      expect(result.current.data?.isRouteAvailable).toBe(true)
      expect(result.current.data?.tokens).toHaveLength(2)
    })

    expect(mockProvider1.getBuyTokens).toHaveBeenCalledWith(mockBuyTokensParams)
    expect(mockProvider2.getBuyTokens).toHaveBeenCalledWith(mockBuyTokensParams)
  })

  it('should handle duplicate tokens by keeping only one instance', async () => {
    const duplicateToken = mockTokens[0]

    mockProvider1.getBuyTokens.mockResolvedValue({
      tokens: [duplicateToken],
      isRouteAvailable: true,
    })

    mockProvider2.getBuyTokens.mockResolvedValue({
      tokens: [duplicateToken],
      isRouteAvailable: true,
    })

    const { result } = renderHook(() => useBridgeSupportedTokens(mockBuyTokensParams), { wrapper })

    await waitFor(() => {
      expect(result.current.data).not.toBeNull()
      expect(result.current.data?.tokens).toHaveLength(1)
      expect(result.current.data?.tokens[0]).toBeInstanceOf(TokenWithLogo)
    })
  })

  it('should set isRouteAvailable to false when no providers have routes available', async () => {
    mockProvider1.getBuyTokens.mockResolvedValue({
      tokens: [],
      isRouteAvailable: false,
    })

    mockProvider2.getBuyTokens.mockResolvedValue({
      tokens: [],
      isRouteAvailable: false,
    })

    const { result } = renderHook(() => useBridgeSupportedTokens(mockBuyTokensParams), { wrapper })

    await waitFor(() => {
      expect(result.current.data).not.toBeNull()
      expect(result.current.data?.isRouteAvailable).toBe(false)
      expect(result.current.data?.tokens).toHaveLength(0)
    })
  })

  it('should handle provider failures gracefully', async () => {
    mockProvider1.getBuyTokens.mockRejectedValue(new Error('Provider 1 failed'))
    mockProvider2.getBuyTokens.mockResolvedValue({
      tokens: [mockTokens[0]],
      isRouteAvailable: true,
    })

    const { result } = renderHook(() => useBridgeSupportedTokens(mockBuyTokensParams), { wrapper })

    await waitFor(() => {
      expect(result.current.data).not.toBeNull()
      expect(result.current.data?.isRouteAvailable).toBe(true)
      expect(result.current.data?.tokens).toHaveLength(1)
    })
  })

  it('should create proper cache key with all parameters', () => {
    const { rerender } = renderHook(({ params }) => useBridgeSupportedTokens(params), {
      wrapper,
      initialProps: { params: mockBuyTokensParams },
    })

    // Change params to trigger re-fetch
    const newParams = { ...mockBuyTokensParams, sellChainId: SupportedChainId.GNOSIS_CHAIN }
    rerender({ params: newParams })

    expect(mockProvider1.getBuyTokens).toHaveBeenCalledWith(mockBuyTokensParams)
  })

  it('should not fetch when bridging is disabled', () => {
    mockUseIsBridgingEnabled.mockReturnValue(false)

    renderHook(() => useBridgeSupportedTokens(mockBuyTokensParams), { wrapper })

    expect(mockProvider1.getBuyTokens).not.toHaveBeenCalled()
    expect(mockProvider2.getBuyTokens).not.toHaveBeenCalled()
  })

  it('should handle mixed provider results correctly', async () => {
    mockProvider1.getBuyTokens.mockResolvedValue({
      tokens: [mockTokens[0]],
      isRouteAvailable: true,
    })

    mockProvider2.getBuyTokens.mockResolvedValue({
      tokens: [],
      isRouteAvailable: false,
    })

    const { result } = renderHook(() => useBridgeSupportedTokens(mockBuyTokensParams), { wrapper })

    await waitFor(() => {
      expect(result.current.data).not.toBeNull()
      expect(result.current.data?.isRouteAvailable).toBe(true)
      expect(result.current.data?.tokens).toHaveLength(1)
    })
  })
})
