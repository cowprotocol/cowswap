import React, { ReactNode } from 'react'

import { ALL_SUPPORTED_CHAINS, SupportedChainId } from '@cowprotocol/cow-sdk'
import { BridgeProvider, BridgeQuoteResult } from '@cowprotocol/sdk-bridging'
import { ALL_SUPPORTED_CHAINS_MAP } from '@cowprotocol/sdk-config'

import { renderHook, waitFor } from '@testing-library/react'
import { SWRConfig } from 'swr'

import { useBridgeProviders } from './useBridgeProviders'
import { useBridgeSupportedNetwork, useBridgeSupportedNetworks } from './useBridgeSupportedNetworks'

jest.mock('./useBridgeProviders', () => ({
  useBridgeProviders: jest.fn(),
}))

const mockUseBridgeProviders = useBridgeProviders as jest.MockedFunction<typeof useBridgeProviders>

// Mock console.error to avoid noise in tests
jest.spyOn(console, 'error').mockImplementation(() => {})

const chains = ALL_SUPPORTED_CHAINS.sort((a, b) => a.id - b.id)

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

const wrapper = ({ children }: { children: React.ReactNode }): ReactNode => {
  return <SWRConfig value={{ provider: () => new Map() }}>{children}</SWRConfig>
}

describe('useBridgeSupportedNetworks', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUseBridgeProviders.mockReturnValue([mockProvider1, mockProvider2])
  })

  afterEach(() => {
    jest.clearAllTimers()
  })

  it('should fetch and combine networks from multiple providers', async () => {
    mockProvider1.getNetworks.mockResolvedValue([chains[0], chains[1]])
    mockProvider2.getNetworks.mockResolvedValue([chains[1], chains[2]])

    const { result } = renderHook(() => useBridgeSupportedNetworks(), { wrapper })

    await waitFor(() => {
      expect(result.current.data).toHaveLength(3)
      expect(result.current.isLoading).toBe(false)
    })

    expect(mockProvider1.getNetworks).toHaveBeenCalledTimes(1)
    expect(mockProvider2.getNetworks).toHaveBeenCalledTimes(1)

    const networks = result.current.data!
    expect(networks.find((n) => n.id === 1)).toBeDefined()
    expect(networks.find((n) => n.id === 56)).toBeDefined()
    expect(networks.find((n) => n.id === 100)).toBeDefined()
  })

  it('should deduplicate networks by id', async () => {
    const duplicateNetwork = chains[0]

    mockProvider1.getNetworks.mockResolvedValue([duplicateNetwork])
    mockProvider2.getNetworks.mockResolvedValue([duplicateNetwork])

    const { result } = renderHook(() => useBridgeSupportedNetworks(), { wrapper })

    await waitFor(() => {
      expect(result.current.data).toHaveLength(1)
      expect(result.current.data![0]).toEqual(duplicateNetwork)
    })
  })

  it('should handle provider failures gracefully', async () => {
    mockProvider1.getNetworks.mockRejectedValue(new Error('Provider 1 failed'))
    mockProvider2.getNetworks.mockResolvedValue([chains[0]])

    const { result } = renderHook(() => useBridgeSupportedNetworks(), { wrapper })

    await waitFor(() => {
      expect(result.current.data).toHaveLength(1)
      expect(result.current.data![0]).toEqual(chains[0])
    })
  })

  it('should return empty array when all providers fail', async () => {
    mockProvider1.getNetworks.mockRejectedValue(new Error('Provider 1 failed'))
    mockProvider2.getNetworks.mockRejectedValue(new Error('Provider 2 failed'))

    const { result } = renderHook(() => useBridgeSupportedNetworks(), { wrapper })

    await waitFor(() => {
      expect(result.current.data).toEqual([])
    })
  })

  it('should create proper cache key with provider ids', () => {
    const { result, rerender } = renderHook(() => useBridgeSupportedNetworks(), { wrapper })

    // Change providers to trigger re-fetch
    const newProvider = { ...mockProvider1, info: { ...mockProvider1.info, dappId: 'provider3' } }
    mockUseBridgeProviders.mockReturnValue([newProvider])

    rerender()

    expect(result.current.isValidating || result.current.isLoading).toBe(true)
  })

  it('should handle empty network arrays from providers', async () => {
    mockProvider1.getNetworks.mockResolvedValue([])
    mockProvider2.getNetworks.mockResolvedValue([])

    const { result } = renderHook(() => useBridgeSupportedNetworks(), { wrapper })

    await waitFor(() => {
      expect(result.current.data).toEqual([])
    })
  })

  it('should maintain network object integrity', async () => {
    const networkWithExtraProps = {
      ...chains[0],
      customProp: 'custom value',
    }

    mockProvider1.getNetworks.mockResolvedValue([networkWithExtraProps])

    const { result } = renderHook(() => useBridgeSupportedNetworks(), { wrapper })

    await waitFor(() => {
      expect(result.current.data).toHaveLength(1)
      expect(result.current.data![0]).toEqual(networkWithExtraProps)
    })
  })
})

describe('useBridgeSupportedNetwork', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUseBridgeProviders.mockReturnValue([mockProvider1, mockProvider2])
  })

  it('should return undefined when chainId is undefined', () => {
    mockProvider1.getNetworks.mockResolvedValue(chains)

    const { result } = renderHook(() => useBridgeSupportedNetwork(undefined), { wrapper })

    expect(result.current).toBeUndefined()
  })

  it('should return the correct network when chainId is provided', async () => {
    mockProvider1.getNetworks.mockResolvedValue(chains)

    const { result } = renderHook(() => useBridgeSupportedNetwork(SupportedChainId.ARBITRUM_ONE), { wrapper })

    await waitFor(() => {
      expect(result.current).toEqual(ALL_SUPPORTED_CHAINS_MAP[SupportedChainId.ARBITRUM_ONE])
    })
  })

  it('should return undefined when chainId is not found in networks', async () => {
    mockProvider1.getNetworks.mockResolvedValue(chains)

    const { result } = renderHook(() => useBridgeSupportedNetwork(999), { wrapper })

    await waitFor(() => {
      expect(result.current).toBeUndefined()
    })
  })

  it('should update when chainId changes', async () => {
    mockProvider1.getNetworks.mockResolvedValue(chains)

    const { result, rerender } = renderHook(({ chainId }) => useBridgeSupportedNetwork(chainId), {
      wrapper,
      initialProps: { chainId: 1 },
    })

    await waitFor(() => {
      expect(result.current).toEqual(chains[0])
    })

    rerender({ chainId: 42161 })

    await waitFor(() => {
      expect(result.current).toEqual(chains[1])
    })
  })

  it('should return undefined when networks data is not loaded', () => {
    const { result } = renderHook(() => useBridgeSupportedNetwork(1), { wrapper })

    expect(result.current).toBeUndefined()
  })

  it('should memoize result properly', async () => {
    mockProvider1.getNetworks.mockResolvedValue(chains)

    const { result, rerender } = renderHook(({ chainId }) => useBridgeSupportedNetwork(chainId), {
      wrapper,
      initialProps: { chainId: 1 },
    })

    await waitFor(() => {
      expect(result.current).toEqual(chains[0])
    })

    const firstResult = result.current

    rerender({ chainId: 1 }) // Same chainId

    expect(result.current).toBe(firstResult) // Should be the same reference due to memoization
  })
})
