import { TokenWithLogo } from '@cowprotocol/common-const'
import { useIsBridgingEnabled, useAvailableChains } from '@cowprotocol/common-hooks'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { useWalletInfo, useIsCoinbaseWallet, useWalletSupportedChainIds, WalletInfo } from '@cowprotocol/wallet'

import { renderHook } from '@testing-library/react'
import { useBridgeSupportedNetworks, useRoutesAvailability } from 'entities/bridgeProvider'

import { Field } from 'legacy/state/types'

import { TradeType } from 'modules/trade'

import { useShouldHideNetworkSelector } from 'common/hooks/useShouldHideNetworkSelector'

import { useChainsToSelect, createInputChainsState, createOutputChainsState } from './useChainsToSelect'
import { useSelectTokenWidgetState } from './useSelectTokenWidgetState'

import { DEFAULT_SELECT_TOKEN_WIDGET_STATE } from '../state/selectTokenWidgetAtom'
import { createChainInfoForTests } from '../test-utils/createChainInfoForTests'

// Default routes availability for tests (no unavailable routes, not loading)
const DEFAULT_ROUTES_AVAILABILITY = {
  unavailableChainIds: new Set<number>(),
  loadingChainIds: new Set<number>(),
  isLoading: false,
}

// Minimal SWR response shape for mocking — omits mutate/error/isValidating which aren't used in tests
function mockSWR(
  data: ReturnType<typeof useBridgeSupportedNetworks>['data'],
): ReturnType<typeof useBridgeSupportedNetworks> {
  return { data, isLoading: false, error: undefined, isValidating: false, mutate: jest.fn() }
}

jest.mock('@cowprotocol/wallet', () => ({
  ...jest.requireActual('@cowprotocol/wallet'),
  useWalletInfo: jest.fn(),
  useIsCoinbaseWallet: jest.fn().mockReturnValue(false),
  useWalletSupportedChainIds: jest.fn().mockReturnValue(undefined),
}))

jest.mock('@cowprotocol/common-hooks', () => ({
  ...jest.requireActual('@cowprotocol/common-hooks'),
  useIsBridgingEnabled: jest.fn(),
  useAvailableChains: jest.fn(),
}))

jest.mock('entities/bridgeProvider', () => ({
  ...jest.requireActual('entities/bridgeProvider'),
  useBridgeSupportedNetworks: jest.fn(),
  useRoutesAvailability: jest.fn(),
}))

jest.mock('./useSelectTokenWidgetState', () => ({
  ...jest.requireActual('./useSelectTokenWidgetState'),
  useSelectTokenWidgetState: jest.fn(),
}))

jest.mock('common/hooks/useShouldHideNetworkSelector', () => ({
  useShouldHideNetworkSelector: jest.fn(),
}))

const mockUseWalletInfo = useWalletInfo as jest.MockedFunction<typeof useWalletInfo>
const mockUseSelectTokenWidgetState = useSelectTokenWidgetState as jest.MockedFunction<typeof useSelectTokenWidgetState>
const mockUseIsCoinbaseWallet = useIsCoinbaseWallet as jest.MockedFunction<typeof useIsCoinbaseWallet>
const mockUseWalletSupportedChainIds = useWalletSupportedChainIds as jest.MockedFunction<
  typeof useWalletSupportedChainIds
>
const mockUseIsBridgingEnabled = useIsBridgingEnabled as jest.MockedFunction<typeof useIsBridgingEnabled>
const mockUseAvailableChains = useAvailableChains as jest.MockedFunction<typeof useAvailableChains>
const mockUseBridgeSupportedNetworks = useBridgeSupportedNetworks as jest.MockedFunction<
  typeof useBridgeSupportedNetworks
>
const mockUseRoutesAvailability = useRoutesAvailability as jest.MockedFunction<typeof useRoutesAvailability>
const mockUseShouldHideNetworkSelector = useShouldHideNetworkSelector as jest.MockedFunction<
  typeof useShouldHideNetworkSelector
>

type WidgetState = ReturnType<typeof useSelectTokenWidgetState>
const createWidgetState = (override: Partial<typeof DEFAULT_SELECT_TOKEN_WIDGET_STATE>): WidgetState => {
  return {
    ...DEFAULT_SELECT_TOKEN_WIDGET_STATE,
    ...override,
  }
}

describe('useChainsToSelect state builders', () => {
  it('sorts sell-side chains using the canonical order', () => {
    const supportedChains = [
      createChainInfoForTests(SupportedChainId.AVALANCHE),
      createChainInfoForTests(SupportedChainId.BASE),
      createChainInfoForTests(SupportedChainId.MAINNET),
    ]

    const state = createInputChainsState(SupportedChainId.BASE, supportedChains)

    expect((state.chains ?? []).map((chain) => chain.id)).toEqual([
      SupportedChainId.MAINNET,
      SupportedChainId.BASE,
      SupportedChainId.AVALANCHE,
    ])
  })

  it('sorts BUY chains using the canonical order and returns all supportedChains', () => {
    const supportedChains = [
      createChainInfoForTests(SupportedChainId.AVALANCHE),
      createChainInfoForTests(SupportedChainId.BASE),
      createChainInfoForTests(SupportedChainId.ARBITRUM_ONE),
      createChainInfoForTests(SupportedChainId.MAINNET),
    ]
    const bridgeChains = [
      createChainInfoForTests(SupportedChainId.MAINNET),
      createChainInfoForTests(SupportedChainId.BASE),
    ]

    const state = createOutputChainsState({
      selectedTargetChainId: SupportedChainId.BASE,
      chainId: SupportedChainId.MAINNET,
      currentChainInfo: createChainInfoForTests(SupportedChainId.MAINNET),
      bridgeSupportedNetworks: bridgeChains,
      supportedChains,
      isLoading: false,
      routesAvailability: DEFAULT_ROUTES_AVAILABILITY,
    })

    // Should return all supportedChains, sorted by canonical order
    expect((state.chains ?? []).map((chain) => chain.id)).toEqual([
      SupportedChainId.MAINNET,
      SupportedChainId.BASE,
      SupportedChainId.ARBITRUM_ONE,
      SupportedChainId.AVALANCHE,
    ])
  })

  it('disables chains not in bridge destinations when source is bridge-supported', () => {
    const supportedChains = [
      createChainInfoForTests(SupportedChainId.MAINNET),
      createChainInfoForTests(SupportedChainId.BASE),
      createChainInfoForTests(SupportedChainId.ARBITRUM_ONE),
      createChainInfoForTests(SupportedChainId.AVALANCHE),
    ]
    const bridgeChains = [
      createChainInfoForTests(SupportedChainId.MAINNET),
      createChainInfoForTests(SupportedChainId.BASE),
    ]

    const state = createOutputChainsState({
      selectedTargetChainId: SupportedChainId.BASE,
      chainId: SupportedChainId.MAINNET,
      currentChainInfo: createChainInfoForTests(SupportedChainId.MAINNET),
      bridgeSupportedNetworks: bridgeChains,
      supportedChains,
      isLoading: false,
      routesAvailability: DEFAULT_ROUTES_AVAILABILITY,
    })

    // Source (Mainnet) and Base are bridge-supported, others should be disabled
    expect(state.disabledChainIds?.has(SupportedChainId.MAINNET)).toBeFalsy()
    expect(state.disabledChainIds?.has(SupportedChainId.BASE)).toBeFalsy()
    expect(state.disabledChainIds?.has(SupportedChainId.ARBITRUM_ONE)).toBe(true)
    expect(state.disabledChainIds?.has(SupportedChainId.AVALANCHE)).toBe(true)
  })

  it('disables all chains except source when source chain is not bridge-supported', () => {
    const supportedChains = [
      createChainInfoForTests(SupportedChainId.MAINNET),
      createChainInfoForTests(SupportedChainId.BASE),
      createChainInfoForTests(SupportedChainId.LINEA),
      createChainInfoForTests(SupportedChainId.ARBITRUM_ONE),
    ]
    const bridgeChains = [
      createChainInfoForTests(SupportedChainId.MAINNET),
      createChainInfoForTests(SupportedChainId.BASE),
      createChainInfoForTests(SupportedChainId.ARBITRUM_ONE),
    ]

    const state = createOutputChainsState({
      selectedTargetChainId: SupportedChainId.BASE,
      chainId: SupportedChainId.LINEA, // Not in bridge destinations
      currentChainInfo: createChainInfoForTests(SupportedChainId.LINEA),
      bridgeSupportedNetworks: bridgeChains,
      supportedChains,
      isLoading: false,
      routesAvailability: DEFAULT_ROUTES_AVAILABILITY,
    })

    // When the source chain isn't bridge-supported, all other chains should be disabled
    expect(state.disabledChainIds?.has(SupportedChainId.LINEA)).toBeFalsy()
    expect(state.disabledChainIds?.has(SupportedChainId.MAINNET)).toBe(true)
    expect(state.disabledChainIds?.has(SupportedChainId.BASE)).toBe(true)
    expect(state.disabledChainIds?.has(SupportedChainId.ARBITRUM_ONE)).toBe(true)
    // And we should default to the source since the selected target is disabled
    expect(state.defaultChainId).toBe(SupportedChainId.LINEA)
  })

  it('disables all chains except source when routes are unavailable from the source', () => {
    const supportedChains = [
      createChainInfoForTests(SupportedChainId.MAINNET),
      createChainInfoForTests(SupportedChainId.ARBITRUM_ONE),
      createChainInfoForTests(SupportedChainId.SEPOLIA),
    ]
    const bridgeChains = [
      createChainInfoForTests(SupportedChainId.MAINNET),
      createChainInfoForTests(SupportedChainId.ARBITRUM_ONE),
    ]

    const state = createOutputChainsState({
      selectedTargetChainId: SupportedChainId.BASE,
      chainId: SupportedChainId.SEPOLIA, // Sepolia not in bridge destinations
      currentChainInfo: createChainInfoForTests(SupportedChainId.SEPOLIA),
      bridgeSupportedNetworks: bridgeChains,
      supportedChains,
      isLoading: false,
      routesAvailability: {
        unavailableChainIds: new Set([SupportedChainId.MAINNET, SupportedChainId.ARBITRUM_ONE]),
        loadingChainIds: new Set<number>(),
        isLoading: false,
      },
    })

    // Default to source chain when the selected target isn't available
    expect(state.defaultChainId).toBe(SupportedChainId.SEPOLIA)
    // Should return all supportedChains
    expect(state.chains?.map((chain) => chain.id)).toEqual([
      SupportedChainId.MAINNET,
      SupportedChainId.ARBITRUM_ONE,
      SupportedChainId.SEPOLIA,
    ])
    // All chains except source should be disabled
    expect(state.disabledChainIds?.has(SupportedChainId.MAINNET)).toBe(true)
    expect(state.disabledChainIds?.has(SupportedChainId.ARBITRUM_ONE)).toBe(true)
    expect(state.disabledChainIds?.has(SupportedChainId.SEPOLIA)).toBeFalsy()
  })

  it('falls back to source when selected target is disabled', () => {
    const supportedChains = [
      createChainInfoForTests(SupportedChainId.MAINNET),
      createChainInfoForTests(SupportedChainId.BASE),
      createChainInfoForTests(SupportedChainId.AVALANCHE),
    ]
    const bridgeChains = [
      createChainInfoForTests(SupportedChainId.MAINNET),
      createChainInfoForTests(SupportedChainId.BASE),
    ]

    const state = createOutputChainsState({
      selectedTargetChainId: SupportedChainId.AVALANCHE, // Not in bridge destinations
      chainId: SupportedChainId.MAINNET,
      currentChainInfo: createChainInfoForTests(SupportedChainId.MAINNET),
      bridgeSupportedNetworks: bridgeChains,
      supportedChains,
      isLoading: false,
      routesAvailability: DEFAULT_ROUTES_AVAILABILITY,
    })

    // Avalanche is disabled, so should fallback to source (Mainnet)
    expect(state.defaultChainId).toBe(SupportedChainId.MAINNET)
  })

  it('does not apply disabled state while loading bridge data', () => {
    const supportedChains = [
      createChainInfoForTests(SupportedChainId.MAINNET),
      createChainInfoForTests(SupportedChainId.BASE),
      createChainInfoForTests(SupportedChainId.GNOSIS_CHAIN),
    ]

    const state = createOutputChainsState({
      selectedTargetChainId: SupportedChainId.BASE,
      chainId: SupportedChainId.MAINNET,
      currentChainInfo: createChainInfoForTests(SupportedChainId.MAINNET),
      bridgeSupportedNetworks: undefined,
      supportedChains,
      isLoading: true, // Still loading
      routesAvailability: DEFAULT_ROUTES_AVAILABILITY,
    })

    // Should render all supportedChains
    expect(state.chains?.length).toBe(3)
    // No chains should be disabled while loading
    expect(state.disabledChainIds).toBeUndefined()
    // Selected target should be valid since nothing is disabled
    expect(state.defaultChainId).toBe(SupportedChainId.BASE)
  })

  it('disables all except source when bridge data fails to load', () => {
    const supportedChains = [
      createChainInfoForTests(SupportedChainId.MAINNET),
      createChainInfoForTests(SupportedChainId.BASE),
      createChainInfoForTests(SupportedChainId.GNOSIS_CHAIN),
    ]

    const state = createOutputChainsState({
      selectedTargetChainId: SupportedChainId.BASE,
      chainId: SupportedChainId.MAINNET,
      currentChainInfo: createChainInfoForTests(SupportedChainId.MAINNET),
      bridgeSupportedNetworks: undefined,
      supportedChains,
      isLoading: false, // Finished loading, but no data
      routesAvailability: DEFAULT_ROUTES_AVAILABILITY,
    })

    // Should render all supportedChains
    expect(state.chains?.length).toBe(3)
    // All chains except source should be disabled when bridge data failed
    expect(state.disabledChainIds?.has(SupportedChainId.MAINNET)).toBeFalsy()
    expect(state.disabledChainIds?.has(SupportedChainId.BASE)).toBe(true)
    expect(state.disabledChainIds?.has(SupportedChainId.GNOSIS_CHAIN)).toBe(true)
    // Default should fallback to source since selected target is disabled
    expect(state.defaultChainId).toBe(SupportedChainId.MAINNET)
  })

  it('injects current chain when not in supportedChains (feature-flagged chain)', () => {
    // Simulate a scenario where wallet is on a feature-flagged chain not in supportedChains
    const supportedChains = [
      createChainInfoForTests(SupportedChainId.MAINNET),
      createChainInfoForTests(SupportedChainId.BASE),
    ]
    const bridgeChains = [
      createChainInfoForTests(SupportedChainId.MAINNET),
      createChainInfoForTests(SupportedChainId.BASE),
    ]

    const state = createOutputChainsState({
      selectedTargetChainId: SupportedChainId.BASE,
      chainId: SupportedChainId.GNOSIS_CHAIN, // Not in supportedChains
      currentChainInfo: createChainInfoForTests(SupportedChainId.GNOSIS_CHAIN),
      bridgeSupportedNetworks: bridgeChains,
      supportedChains,
      isLoading: false,
      routesAvailability: DEFAULT_ROUTES_AVAILABILITY,
    })

    // Current chain should be injected into the list
    expect(state.chains?.some((c) => c.id === SupportedChainId.GNOSIS_CHAIN)).toBe(true)
    // Should have 3 chains: Mainnet, Base, and injected Gnosis
    expect(state.chains?.length).toBe(3)
  })
})

describe('useChainsToSelect hook', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUseWalletInfo.mockReturnValue({ chainId: SupportedChainId.MAINNET } as WalletInfo)
    mockUseIsBridgingEnabled.mockReturnValue(true)
    mockUseAvailableChains.mockReturnValue([SupportedChainId.MAINNET, SupportedChainId.GNOSIS_CHAIN])
    mockUseBridgeSupportedNetworks.mockReturnValue(mockSWR([createChainInfoForTests(SupportedChainId.GNOSIS_CHAIN)]))
    mockUseRoutesAvailability.mockReturnValue(DEFAULT_ROUTES_AVAILABILITY)
    mockUseShouldHideNetworkSelector.mockReturnValue(false)
  })

  it('returns undefined for LIMIT_ORDER + OUTPUT (buy token)', () => {
    mockUseSelectTokenWidgetState.mockReturnValue(
      createWidgetState({
        field: Field.OUTPUT,
        tradeType: TradeType.LIMIT_ORDER,
        selectedTargetChainId: SupportedChainId.MAINNET,
      }),
    )

    const { result } = renderHook(() => useChainsToSelect())

    expect(result.current).toBeUndefined()
  })

  it('returns undefined for ADVANCED_ORDERS + OUTPUT (buy token)', () => {
    mockUseSelectTokenWidgetState.mockReturnValue(
      createWidgetState({
        field: Field.OUTPUT,
        tradeType: TradeType.ADVANCED_ORDERS,
        selectedTargetChainId: SupportedChainId.MAINNET,
      }),
    )

    const { result } = renderHook(() => useChainsToSelect())

    expect(result.current).toBeUndefined()
  })

  it('returns undefined for LIMIT_ORDER + INPUT (sell token)', () => {
    mockUseSelectTokenWidgetState.mockReturnValue(
      createWidgetState({
        field: Field.INPUT,
        tradeType: TradeType.LIMIT_ORDER,
        selectedTargetChainId: SupportedChainId.MAINNET,
      }),
    )

    const { result } = renderHook(() => useChainsToSelect())

    expect(result.current).toBeUndefined()
  })

  it('returns undefined for ADVANCED_ORDERS + INPUT (sell token)', () => {
    mockUseSelectTokenWidgetState.mockReturnValue(
      createWidgetState({
        field: Field.INPUT,
        tradeType: TradeType.ADVANCED_ORDERS,
        selectedTargetChainId: SupportedChainId.MAINNET,
      }),
    )

    const { result } = renderHook(() => useChainsToSelect())

    expect(result.current).toBeUndefined()
  })

  it('returns chains for SWAP + OUTPUT (buy token)', () => {
    // Include Mainnet in bridge data to exercise bridge destinations path
    // Use mockReturnValueOnce for test isolation
    mockUseBridgeSupportedNetworks.mockReturnValueOnce(
      mockSWR([
        createChainInfoForTests(SupportedChainId.MAINNET),
        createChainInfoForTests(SupportedChainId.GNOSIS_CHAIN),
      ]),
    )

    mockUseSelectTokenWidgetState.mockReturnValue(
      createWidgetState({
        field: Field.OUTPUT,
        tradeType: TradeType.SWAP,
        selectedTargetChainId: SupportedChainId.MAINNET,
      }),
    )

    const { result } = renderHook(() => useChainsToSelect())

    expect(result.current).toBeDefined()
    expect(result.current?.chains).toBeDefined()
    expect(result.current?.chains?.length).toBeGreaterThan(0)
    // Verify defaultChainId matches selectedTargetChainId (confirms bridge path, not fallback)
    expect(result.current?.defaultChainId).toBe(SupportedChainId.MAINNET)
    // Verify it returns bridge destinations (Gnosis), not single-chain fallback
    expect(result.current?.chains?.some((chain) => chain.id === SupportedChainId.GNOSIS_CHAIN)).toBe(true)
  })

  it('uses oppositeToken.chainId as sourceChainId for routes availability in OUTPUT field', () => {
    const sellTokenOnLinea = new TokenWithLogo(
      undefined,
      SupportedChainId.LINEA,
      '0x0000000000000000000000000000000000000001',
      18,
      'TKN',
      'Token',
    )

    mockUseWalletInfo.mockReturnValue({ chainId: SupportedChainId.MAINNET } as WalletInfo)
    mockUseSelectTokenWidgetState.mockReturnValue(
      createWidgetState({
        field: Field.OUTPUT,
        tradeType: TradeType.SWAP,
        selectedTargetChainId: SupportedChainId.BASE,
        oppositeToken: sellTokenOnLinea,
      }),
    )

    renderHook(() => useChainsToSelect())

    expect(mockUseRoutesAvailability).toHaveBeenCalledWith(SupportedChainId.LINEA, expect.any(Array))
  })

  it('returns chains for SWAP + INPUT (sell token)', () => {
    mockUseSelectTokenWidgetState.mockReturnValue(
      createWidgetState({
        field: Field.INPUT,
        tradeType: TradeType.SWAP,
        selectedTargetChainId: SupportedChainId.MAINNET,
      }),
    )

    const { result } = renderHook(() => useChainsToSelect())

    expect(result.current).toBeDefined()
    expect(result.current?.chains).toBeDefined()
    expect(result.current?.chains?.length).toBeGreaterThan(0)
    // Verify defaultChainId matches selectedTargetChainId
    expect(result.current?.defaultChainId).toBe(SupportedChainId.MAINNET)
    // Verify it returns supported chains (Mainnet, Gnosis)
    expect(result.current?.chains?.some((chain) => chain.id === SupportedChainId.MAINNET)).toBe(true)
    expect(result.current?.chains?.some((chain) => chain.id === SupportedChainId.GNOSIS_CHAIN)).toBe(true)
  })

  it('does NOT disable Coinbase SCW unsupported chains for buy token (blocking is handled in swap form)', () => {
    mockUseIsCoinbaseWallet.mockReturnValue(true)
    // Simulate Coinbase SCW capabilities: only Mainnet supported, Gnosis not
    mockUseWalletSupportedChainIds.mockReturnValue(new Set([SupportedChainId.MAINNET]))
    mockUseAvailableChains.mockReturnValue([SupportedChainId.MAINNET, SupportedChainId.GNOSIS_CHAIN])
    mockUseBridgeSupportedNetworks.mockReturnValueOnce(
      mockSWR([
        createChainInfoForTests(SupportedChainId.MAINNET),
        createChainInfoForTests(SupportedChainId.GNOSIS_CHAIN),
      ]),
    )

    mockUseSelectTokenWidgetState.mockReturnValue(
      createWidgetState({
        field: Field.OUTPUT,
        tradeType: TradeType.SWAP,
        selectedTargetChainId: SupportedChainId.MAINNET,
      }),
    )

    const { result } = renderHook(() => useChainsToSelect())

    expect(result.current).toBeDefined()
    // Gnosis should NOT be wallet-disabled for buy token — swap form shows a blocking warning instead
    expect(result.current?.walletUnsupportedChainIds?.has(SupportedChainId.GNOSIS_CHAIN)).toBeFalsy()
    // Both chains should be selectable
    expect(result.current?.chains?.some((chain) => chain.id === SupportedChainId.GNOSIS_CHAIN)).toBe(true)
    expect(result.current?.chains?.some((chain) => chain.id === SupportedChainId.MAINNET)).toBe(true)
  })

  it('does not disable chains when isCoinbaseWallet is false', () => {
    mockUseIsCoinbaseWallet.mockReturnValue(false)
    mockUseWalletSupportedChainIds.mockReturnValue(undefined)
    mockUseAvailableChains.mockReturnValue([SupportedChainId.MAINNET, SupportedChainId.GNOSIS_CHAIN])
    mockUseBridgeSupportedNetworks.mockReturnValueOnce(
      mockSWR([
        createChainInfoForTests(SupportedChainId.MAINNET),
        createChainInfoForTests(SupportedChainId.GNOSIS_CHAIN),
      ]),
    )

    mockUseSelectTokenWidgetState.mockReturnValue(
      createWidgetState({
        field: Field.OUTPUT,
        tradeType: TradeType.SWAP,
        selectedTargetChainId: SupportedChainId.MAINNET,
      }),
    )

    const { result } = renderHook(() => useChainsToSelect())

    expect(result.current).toBeDefined()
    // No wallet-based chain restrictions for non-Coinbase wallets
    expect(result.current?.disabledChainIds?.has(SupportedChainId.GNOSIS_CHAIN)).toBeFalsy()
  })

  it('does not disable chains when isCoinbaseWallet is true but walletSupportedChainIds is undefined (EOA)', () => {
    mockUseIsCoinbaseWallet.mockReturnValue(true)
    mockUseWalletSupportedChainIds.mockReturnValue(undefined)
    mockUseAvailableChains.mockReturnValue([SupportedChainId.MAINNET, SupportedChainId.GNOSIS_CHAIN])
    mockUseBridgeSupportedNetworks.mockReturnValueOnce(
      mockSWR([
        createChainInfoForTests(SupportedChainId.MAINNET),
        createChainInfoForTests(SupportedChainId.GNOSIS_CHAIN),
      ]),
    )

    mockUseSelectTokenWidgetState.mockReturnValue(
      createWidgetState({
        field: Field.OUTPUT,
        tradeType: TradeType.SWAP,
        selectedTargetChainId: SupportedChainId.MAINNET,
      }),
    )

    const { result } = renderHook(() => useChainsToSelect())

    expect(result.current).toBeDefined()
    // Coinbase EOA: no atomic capabilities -> no chain filtering
    expect(result.current?.walletUnsupportedChainIds).toBeUndefined()
  })

  it('disables Coinbase SCW unsupported chains in sell token (INPUT) list', () => {
    mockUseIsCoinbaseWallet.mockReturnValue(true)
    // Simulate Coinbase SCW capabilities: only Mainnet supported
    mockUseWalletSupportedChainIds.mockReturnValue(new Set([SupportedChainId.MAINNET]))
    mockUseAvailableChains.mockReturnValue([SupportedChainId.MAINNET, SupportedChainId.GNOSIS_CHAIN])

    mockUseSelectTokenWidgetState.mockReturnValue(
      createWidgetState({
        field: Field.INPUT,
        tradeType: TradeType.SWAP,
        selectedTargetChainId: SupportedChainId.MAINNET,
      }),
    )

    const { result } = renderHook(() => useChainsToSelect())

    expect(result.current).toBeDefined()
    // Mainnet (supported) should be in the list and not disabled
    expect(result.current?.chains?.some((chain) => chain.id === SupportedChainId.MAINNET)).toBe(true)
    expect(result.current?.disabledChainIds?.has(SupportedChainId.MAINNET)).toBeFalsy()
    // Gnosis (unsupported) should be in the list but disabled
    expect(result.current?.chains?.some((chain) => chain.id === SupportedChainId.GNOSIS_CHAIN)).toBe(true)
    expect(result.current?.disabledChainIds?.has(SupportedChainId.GNOSIS_CHAIN)).toBe(true)
    // walletUnsupportedChainIds should be set for tooltip differentiation
    expect(result.current?.walletUnsupportedChainIds?.has(SupportedChainId.GNOSIS_CHAIN)).toBe(true)
  })

  it('shows all chains in sell token (INPUT) list for non-Coinbase wallets', () => {
    mockUseIsCoinbaseWallet.mockReturnValue(false)
    mockUseAvailableChains.mockReturnValue([SupportedChainId.MAINNET, SupportedChainId.GNOSIS_CHAIN])

    mockUseSelectTokenWidgetState.mockReturnValue(
      createWidgetState({
        field: Field.INPUT,
        tradeType: TradeType.SWAP,
        selectedTargetChainId: SupportedChainId.MAINNET,
      }),
    )

    const { result } = renderHook(() => useChainsToSelect())

    expect(result.current).toBeDefined()
    expect(result.current?.chains?.some((chain) => chain.id === SupportedChainId.MAINNET)).toBe(true)
    expect(result.current?.chains?.some((chain) => chain.id === SupportedChainId.GNOSIS_CHAIN)).toBe(true)
  })

  it('does not apply wallet restrictions for buy token OUTPUT even when connected on unsupported chain', () => {
    mockUseIsCoinbaseWallet.mockReturnValue(true)
    // Simulate Coinbase SCW capabilities: only Mainnet supported
    mockUseWalletSupportedChainIds.mockReturnValue(new Set([SupportedChainId.MAINNET]))
    // Connect on Gnosis (unsupported by Coinbase SCW)
    mockUseWalletInfo.mockReturnValue({ chainId: SupportedChainId.GNOSIS_CHAIN } as WalletInfo)
    mockUseAvailableChains.mockReturnValue([SupportedChainId.MAINNET, SupportedChainId.GNOSIS_CHAIN])
    mockUseBridgeSupportedNetworks.mockReturnValueOnce(
      mockSWR([
        createChainInfoForTests(SupportedChainId.MAINNET),
        createChainInfoForTests(SupportedChainId.GNOSIS_CHAIN),
      ]),
    )

    mockUseSelectTokenWidgetState.mockReturnValue(
      createWidgetState({
        field: Field.OUTPUT,
        tradeType: TradeType.SWAP,
        selectedTargetChainId: SupportedChainId.MAINNET,
      }),
    )

    const { result } = renderHook(() => useChainsToSelect())

    expect(result.current).toBeDefined()
    // No wallet-based restrictions for OUTPUT — swap form handles this via blocking warning
    expect(result.current?.walletUnsupportedChainIds).toBeFalsy()
  })
})
