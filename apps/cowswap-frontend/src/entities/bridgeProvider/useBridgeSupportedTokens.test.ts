import { useIsBridgingEnabled } from '@cowprotocol/common-hooks'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { useTokensByAddressMapForChain } from '@cowprotocol/tokens'

import { renderHook, waitFor } from '@testing-library/react'
import { bridgingSdk } from 'tradingSdk/bridgingSdk'

import { useBridgeProvidersIds } from './useBridgeProvidersIds'
import { useBridgeSupportedTokens } from './useBridgeSupportedTokens'

jest.mock('@cowprotocol/common-hooks', () => ({
  useIsBridgingEnabled: jest.fn(),
}))

jest.mock('@cowprotocol/tokens', () => ({
  useTokensByAddressMapForChain: jest.fn(),
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
const mockUseTokensByAddressMapForChain = useTokensByAddressMapForChain as jest.Mock
const mockUseBridgeProvidersIds = useBridgeProvidersIds as jest.Mock
const mockGetBuyTokens = bridgingSdk.getBuyTokens as jest.Mock

let testId = 0

describe('useBridgeSupportedTokens', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUseIsBridgingEnabled.mockReturnValue(true)
    mockUseTokensByAddressMapForChain.mockReturnValue({})
    // Use unique provider IDs per test to avoid SWR cache conflicts
    testId++
    mockUseBridgeProvidersIds.mockReturnValue([`provider-${testId}`])
  })

  // Regression for [CS-299]: `InvalidBridgeOutputUpdater` treats any resolved `bridgeRouteData` as
  // a confirmed verdict and resets the user's just-picked output currency/target chain the moment
  // `isRouteAvailable` reads false. Resolving a fetch failure into a synthetic
  // `{ isRouteAvailable: false, tokens: [] }` success on the very first attempt made that reset fire
  // on nothing more than one flaky/slow request, wiping a valid selection. A single failure must
  // recover on retry, not fall straight through to "no route".
  it('recovers from a transient failure instead of falling back to "no route" immediately', async () => {
    mockGetBuyTokens.mockRejectedValueOnce(new Error('Network error')).mockResolvedValueOnce({
      tokens: [{ chainId: SupportedChainId.GNOSIS_CHAIN, address: '0x1', decimals: 18, name: 'Token', symbol: 'TKN' }],
      isRouteAvailable: true,
    })

    const { result } = renderHook(() =>
      useBridgeSupportedTokens({ sellChainId: SupportedChainId.MAINNET, buyChainId: SupportedChainId.GNOSIS_CHAIN }),
    )

    await waitFor(
      () => {
        expect(result.current.data?.isRouteAvailable).toBe(true)
        expect(result.current.data?.tokens).toHaveLength(1)
      },
      { timeout: 8000 },
    )

    expect(result.current.error).toBeUndefined()
  }, 10_000)

  // Complements the recovery case above: a route that fails *every* attempt, not just once, must
  // still eventually resolve to "no route" so `InvalidBridgeOutputUpdater` can clear a genuinely,
  // persistently stale destination instead of leaving it stuck forever.
  it('falls back to "no route" once every retry attempt has failed', async () => {
    mockGetBuyTokens.mockRejectedValue(new Error('Network error'))

    const { result } = renderHook(() =>
      useBridgeSupportedTokens({ sellChainId: SupportedChainId.MAINNET, buyChainId: SupportedChainId.GNOSIS_CHAIN }),
    )

    await waitFor(
      () => {
        expect(result.current.data?.isRouteAvailable).toBe(false)
        expect(result.current.data?.tokens).toHaveLength(0)
      },
      { timeout: 8000 },
    )

    expect(mockGetBuyTokens.mock.calls.length).toBeGreaterThan(1)
  }, 10_000)

  it('returns route data when the fetch succeeds', async () => {
    mockGetBuyTokens.mockResolvedValue({
      tokens: [{ chainId: SupportedChainId.GNOSIS_CHAIN, address: '0x1', decimals: 18, name: 'Token', symbol: 'TKN' }],
      isRouteAvailable: true,
    })

    const { result } = renderHook(() =>
      useBridgeSupportedTokens({ sellChainId: SupportedChainId.MAINNET, buyChainId: SupportedChainId.GNOSIS_CHAIN }),
    )

    await waitFor(() => {
      expect(result.current.data?.isRouteAvailable).toBe(true)
      expect(result.current.data?.tokens).toHaveLength(1)
    })
  })

  it('returns unavailable route data when the fetch resolves with no tokens', async () => {
    mockGetBuyTokens.mockResolvedValue({ tokens: [], isRouteAvailable: true })

    const { result } = renderHook(() =>
      useBridgeSupportedTokens({ sellChainId: SupportedChainId.MAINNET, buyChainId: SupportedChainId.GNOSIS_CHAIN }),
    )

    await waitFor(() => {
      expect(result.current.data?.isRouteAvailable).toBe(false)
      expect(result.current.data?.tokens).toHaveLength(0)
    })
  })

  it('returns null data without fetching when params are undefined', () => {
    const { result } = renderHook(() => useBridgeSupportedTokens(undefined))

    expect(mockGetBuyTokens).not.toHaveBeenCalled()
    expect(result.current.data).toBeUndefined()
  })
})
