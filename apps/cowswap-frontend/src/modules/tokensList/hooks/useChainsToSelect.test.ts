import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { useWalletInfo, WalletInfo } from '@cowprotocol/wallet'

import { renderHook } from '@testing-library/react'

import { Field } from 'legacy/state/types'

import { TradeType } from 'modules/trade/types'

import { useChainsToSelect, createInputChainsState, createOutputChainsState } from './useChainsToSelect'
import { useSelectTokenWidgetState } from './useSelectTokenWidgetState'

import { DEFAULT_SELECT_TOKEN_WIDGET_STATE } from '../state/selectTokenWidgetAtom'
import { createChainInfoForTests } from '../test-utils/createChainInfoForTests'

jest.mock('@cowprotocol/wallet', () => ({
  ...jest.requireActual('@cowprotocol/wallet'),
  useWalletInfo: jest.fn(),
}))

jest.mock('@cowprotocol/common-hooks', () => ({
  ...jest.requireActual('@cowprotocol/common-hooks'),
  useIsBridgingEnabled: jest.fn(),
  useAvailableChains: jest.fn(),
  useFeatureFlags: jest.fn(),
}))

jest.mock('entities/bridgeProvider', () => ({
  ...jest.requireActual('entities/bridgeProvider'),
  useBridgeSupportedNetworks: jest.fn(),
}))

jest.mock('./useSelectTokenWidgetState', () => ({
  ...jest.requireActual('./useSelectTokenWidgetState'),
  useSelectTokenWidgetState: jest.fn(),
}))

const mockUseWalletInfo = useWalletInfo as jest.MockedFunction<typeof useWalletInfo>
const mockUseSelectTokenWidgetState = useSelectTokenWidgetState as jest.MockedFunction<typeof useSelectTokenWidgetState>

const { useIsBridgingEnabled, useAvailableChains, useFeatureFlags } = require('@cowprotocol/common-hooks')
const mockUseIsBridgingEnabled = useIsBridgingEnabled as jest.MockedFunction<typeof useIsBridgingEnabled>
const mockUseAvailableChains = useAvailableChains as jest.MockedFunction<typeof useAvailableChains>
const mockUseFeatureFlags = useFeatureFlags as jest.MockedFunction<typeof useFeatureFlags>

const { useBridgeSupportedNetworks } = require('entities/bridgeProvider')
const mockUseBridgeSupportedNetworks = useBridgeSupportedNetworks as jest.MockedFunction<
  typeof useBridgeSupportedNetworks
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

  it('sorts bridge destination chains to match the canonical order', () => {
    const bridgeChains = [
      createChainInfoForTests(SupportedChainId.AVALANCHE),
      createChainInfoForTests(SupportedChainId.BASE),
      createChainInfoForTests(SupportedChainId.ARBITRUM_ONE),
      createChainInfoForTests(SupportedChainId.MAINNET),
    ]

    const state = createOutputChainsState({
      selectedTargetChainId: SupportedChainId.POLYGON,
      chainId: SupportedChainId.MAINNET,
      currentChainInfo: createChainInfoForTests(SupportedChainId.MAINNET),
      bridgeSupportedNetworks: bridgeChains,
      isLoading: false,
    })

    expect((state.chains ?? []).map((chain) => chain.id)).toEqual([
      SupportedChainId.MAINNET,
      SupportedChainId.BASE,
      SupportedChainId.ARBITRUM_ONE,
      SupportedChainId.AVALANCHE,
    ])
  })

  it('returns all bridge destinations even when source chain is not supported by bridge', () => {
    const state = createOutputChainsState({
      selectedTargetChainId: SupportedChainId.BASE,
      chainId: SupportedChainId.SEPOLIA,
      currentChainInfo: createChainInfoForTests(SupportedChainId.SEPOLIA),
      bridgeSupportedNetworks: [
        createChainInfoForTests(SupportedChainId.MAINNET),
        createChainInfoForTests(SupportedChainId.ARBITRUM_ONE),
      ],
      isLoading: false,
    })

    // Default to source chain when the selected target isn't available
    expect(state.defaultChainId).toBe(SupportedChainId.SEPOLIA)
    // Should show all destinations plus source, but destinations disabled when source not supported
    expect(state.chains?.map((chain) => chain.id)).toEqual([
      SupportedChainId.MAINNET,
      SupportedChainId.ARBITRUM_ONE,
      SupportedChainId.SEPOLIA,
    ])
    expect(state.disabledChainIds?.has(SupportedChainId.MAINNET)).toBe(true)
    expect(state.disabledChainIds?.has(SupportedChainId.ARBITRUM_ONE)).toBe(true)
    expect(state.disabledChainIds?.has(SupportedChainId.SEPOLIA)).toBe(false)
  })
})

describe('useChainsToSelect hook', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUseWalletInfo.mockReturnValue({ chainId: SupportedChainId.MAINNET } as WalletInfo)
    mockUseIsBridgingEnabled.mockReturnValue(true)
    mockUseAvailableChains.mockReturnValue([SupportedChainId.MAINNET, SupportedChainId.GNOSIS_CHAIN])
    mockUseFeatureFlags.mockReturnValue({ areUnsupportedChainsEnabled: false })
    mockUseBridgeSupportedNetworks.mockReturnValue({
      data: [createChainInfoForTests(SupportedChainId.GNOSIS_CHAIN)],
      isLoading: false,
    })
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
    mockUseBridgeSupportedNetworks.mockReturnValueOnce({
      data: [createChainInfoForTests(SupportedChainId.MAINNET), createChainInfoForTests(SupportedChainId.GNOSIS_CHAIN)],
      isLoading: false,
    })

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
})
