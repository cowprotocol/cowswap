import { useIsBridgingEnabled } from '@cowprotocol/common-hooks'
import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { renderHook, waitFor } from '@testing-library/react'
import { bridgingSdk } from 'tradingSdk/bridgingSdk'

import { useBridgeProvidersIds } from './useBridgeProvidersIds'
import { useRoutesAvailability } from './useRoutesAvailability'

// Mock dependencies
jest.mock('@cowprotocol/common-hooks', () => ({
  useIsBridgingEnabled: jest.fn(),
}))

jest.mock('./useBridgeProvidersIds', () => ({
  useBridgeProvidersIds: jest.fn(),
}))

jest.mock('tradingSdk/bridgingSdk', () => ({
  bridgingSdk: {
    getBuyTokens: jest.fn(),
  },
}))

const mockUseIsBridgingEnabled = useIsBridgingEnabled as jest.Mock
const mockUseBridgeProvidersIds = useBridgeProvidersIds as jest.Mock
const mockGetBuyTokens = bridgingSdk.getBuyTokens as jest.Mock

let testId = 0

describe('useRoutesAvailability', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUseIsBridgingEnabled.mockReturnValue(true)
    // Use unique provider IDs per test to avoid SWR cache conflicts
    testId++
    mockUseBridgeProvidersIds.mockReturnValue([`provider-${testId}`])
  })

  it('returns empty result when bridging is disabled', () => {
    mockUseIsBridgingEnabled.mockReturnValue(false)

    const { result } = renderHook(() =>
      useRoutesAvailability(SupportedChainId.MAINNET, [SupportedChainId.GNOSIS_CHAIN]),
    )

    expect(result.current).toEqual({
      unavailableChainIds: new Set(),
      loadingChainIds: new Set(),
      isLoading: false,
    })
  })

  it('returns empty result when sourceChainId is undefined', () => {
    const { result } = renderHook(() => useRoutesAvailability(undefined, [SupportedChainId.GNOSIS_CHAIN]))

    expect(result.current).toEqual({
      unavailableChainIds: new Set(),
      loadingChainIds: new Set(),
      isLoading: false,
    })
  })

  it('returns empty result when destinationChainIds is empty', () => {
    const { result } = renderHook(() => useRoutesAvailability(SupportedChainId.MAINNET, []))

    expect(result.current).toEqual({
      unavailableChainIds: new Set(),
      loadingChainIds: new Set(),
      isLoading: false,
    })
  })

  it('excludes source chain from chains to check', async () => {
    mockGetBuyTokens.mockResolvedValue({ tokens: ['token1'], isRouteAvailable: true })

    renderHook(() =>
      useRoutesAvailability(SupportedChainId.MAINNET, [
        SupportedChainId.MAINNET, // same as source, should be excluded
        SupportedChainId.GNOSIS_CHAIN,
      ]),
    )

    await waitFor(() => {
      expect(mockGetBuyTokens).toHaveBeenCalledTimes(1)
      expect(mockGetBuyTokens).toHaveBeenCalledWith({
        sellChainId: SupportedChainId.MAINNET,
        buyChainId: SupportedChainId.GNOSIS_CHAIN,
      })
    })
  })

  it('marks chains as unavailable when route check fails', async () => {
    mockGetBuyTokens.mockRejectedValue(new Error('Network error'))

    const { result } = renderHook(() =>
      useRoutesAvailability(SupportedChainId.MAINNET, [SupportedChainId.GNOSIS_CHAIN]),
    )

    await waitFor(() => {
      expect(result.current.unavailableChainIds.has(SupportedChainId.GNOSIS_CHAIN)).toBe(true)
      expect(result.current.isLoading).toBe(false)
    })
  })

  it('marks chains as unavailable when no tokens available', async () => {
    mockGetBuyTokens.mockResolvedValue({ tokens: [], isRouteAvailable: true })

    const { result } = renderHook(() =>
      useRoutesAvailability(SupportedChainId.MAINNET, [SupportedChainId.GNOSIS_CHAIN]),
    )

    await waitFor(() => {
      expect(result.current.unavailableChainIds.has(SupportedChainId.GNOSIS_CHAIN)).toBe(true)
      expect(result.current.isLoading).toBe(false)
    })
  })

  it('marks chains as unavailable when route is not available', async () => {
    mockGetBuyTokens.mockResolvedValue({ tokens: ['token1'], isRouteAvailable: false })

    const { result } = renderHook(() =>
      useRoutesAvailability(SupportedChainId.MAINNET, [SupportedChainId.GNOSIS_CHAIN]),
    )

    await waitFor(() => {
      expect(result.current.unavailableChainIds.has(SupportedChainId.GNOSIS_CHAIN)).toBe(true)
      expect(result.current.isLoading).toBe(false)
    })
  })

  it('marks chains as available when route exists', async () => {
    mockGetBuyTokens.mockResolvedValue({ tokens: ['token1'], isRouteAvailable: true })

    const { result } = renderHook(() =>
      useRoutesAvailability(SupportedChainId.MAINNET, [SupportedChainId.GNOSIS_CHAIN]),
    )

    await waitFor(() => {
      expect(result.current.unavailableChainIds.has(SupportedChainId.GNOSIS_CHAIN)).toBe(false)
      expect(result.current.isLoading).toBe(false)
    })
  })

  it('checks multiple destination chains in parallel', async () => {
    // Mock based on buyChainId parameter
    mockGetBuyTokens.mockImplementation(({ buyChainId }) => {
      if (buyChainId === SupportedChainId.GNOSIS_CHAIN) {
        return Promise.resolve({ tokens: ['token1'], isRouteAvailable: true })
      }
      return Promise.resolve({ tokens: [], isRouteAvailable: false })
    })

    const { result } = renderHook(() =>
      useRoutesAvailability(SupportedChainId.MAINNET, [SupportedChainId.GNOSIS_CHAIN, SupportedChainId.ARBITRUM_ONE]),
    )

    await waitFor(() => {
      expect(mockGetBuyTokens).toHaveBeenCalledTimes(2)
      expect(result.current.unavailableChainIds.has(SupportedChainId.ARBITRUM_ONE)).toBe(true)
      expect(result.current.unavailableChainIds.has(SupportedChainId.GNOSIS_CHAIN)).toBe(false)
    })
  })
})
