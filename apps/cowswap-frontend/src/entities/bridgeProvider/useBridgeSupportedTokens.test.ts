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
  // `isRouteAvailable` reads false. Resolving a transient fetch failure into a synthetic
  // `{ isRouteAvailable: false, tokens: [] }` success made that reset fire on nothing more than a
  // flaky/slow request, wiping a valid selection. The fetch must fail as an SWR error instead, so
  // `InvalidBridgeOutputUpdater`'s own `!bridgeRouteData` guard treats it as "unresolved" rather
  // than "confirmed unsupported" (matching how its sibling `useBridgeSupportedNetworks` already
  // behaves on a fetch failure).
  it('surfaces a failed fetch as an SWR error instead of a synthetic "no route" result', async () => {
    mockGetBuyTokens.mockRejectedValue(new Error('Network error'))

    const { result } = renderHook(() =>
      useBridgeSupportedTokens({ sellChainId: SupportedChainId.MAINNET, buyChainId: SupportedChainId.GNOSIS_CHAIN }),
    )

    await waitFor(() => {
      expect(result.current.error).toBeInstanceOf(Error)
    })

    expect(result.current.data).toBeUndefined()
  })

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
