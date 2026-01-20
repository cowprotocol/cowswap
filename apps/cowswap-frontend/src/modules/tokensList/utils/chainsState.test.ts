import { ChainInfo, SupportedChainId } from '@cowprotocol/cow-sdk'

import {
  filterDestinationChains,
  createInputChainsState,
  computeDisabledChainIds,
  resolveDefaultChainId,
  createOutputChainsState,
  CreateOutputChainsOptions,
} from './chainsState'
import { sortChainsByDisplayOrder } from './sortChainsByDisplayOrder'

jest.mock('./sortChainsByDisplayOrder', () => ({
  sortChainsByDisplayOrder: jest.fn((chains: ChainInfo[]) => chains),
}))

const mockSortChainsByDisplayOrder = sortChainsByDisplayOrder as jest.MockedFunction<typeof sortChainsByDisplayOrder>

const createChainInfo = (id: number, name = `Chain ${id}`): ChainInfo =>
  ({
    id,
    name,
    label: name,
    logo: '',
  }) as unknown as ChainInfo

const MAINNET = createChainInfo(SupportedChainId.MAINNET, 'Ethereum')
const GNOSIS = createChainInfo(SupportedChainId.GNOSIS_CHAIN, 'Gnosis')
const ARBITRUM = createChainInfo(SupportedChainId.ARBITRUM_ONE, 'Arbitrum')
const BASE = createChainInfo(SupportedChainId.BASE, 'Base')
const UNSUPPORTED = createChainInfo(999999, 'Unsupported')

describe('chainsState', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockSortChainsByDisplayOrder.mockImplementation((chains) => chains)
  })

  describe('filterDestinationChains', () => {
    it('returns undefined when input is undefined', () => {
      expect(filterDestinationChains(undefined)).toBeUndefined()
    })

    it('returns empty array when input is empty', () => {
      expect(filterDestinationChains([])).toEqual([])
    })

    it('filters out unsupported chains', () => {
      const chains = [MAINNET, GNOSIS, UNSUPPORTED]
      const result = filterDestinationChains(chains)

      expect(result).toHaveLength(2)
      expect(result).toContainEqual(MAINNET)
      expect(result).toContainEqual(GNOSIS)
      expect(result).not.toContainEqual(UNSUPPORTED)
    })

    it('keeps all supported chains', () => {
      const chains = [MAINNET, GNOSIS, ARBITRUM, BASE]
      const result = filterDestinationChains(chains)

      expect(result).toHaveLength(4)
      expect(result).toEqual(chains)
    })
  })

  describe('createInputChainsState', () => {
    it('creates state with sorted chains and default chain id', () => {
      const chains = [MAINNET, GNOSIS]
      const result = createInputChainsState(SupportedChainId.MAINNET, chains)

      expect(result).toEqual({
        defaultChainId: SupportedChainId.MAINNET,
        chains,
        isLoading: false,
      })
      expect(mockSortChainsByDisplayOrder).toHaveBeenCalledWith(chains)
    })

    it('uses custom selectedTargetChainId as defaultChainId', () => {
      const chains = [MAINNET, GNOSIS]
      const result = createInputChainsState(SupportedChainId.GNOSIS_CHAIN, chains)

      expect(result.defaultChainId).toBe(SupportedChainId.GNOSIS_CHAIN)
    })
  })

  describe('computeDisabledChainIds', () => {
    it('returns empty set when isLoading is true', () => {
      const result = computeDisabledChainIds(
        [MAINNET, GNOSIS, ARBITRUM],
        SupportedChainId.MAINNET,
        new Set([SupportedChainId.GNOSIS_CHAIN]),
        true,
        true, // isLoading
      )

      expect(result.size).toBe(0)
    })

    it('excludes the current chainId from disabled set', () => {
      const result = computeDisabledChainIds(
        [MAINNET, GNOSIS, ARBITRUM],
        SupportedChainId.MAINNET,
        new Set([SupportedChainId.GNOSIS_CHAIN]),
        true,
        false,
      )

      expect(result.has(SupportedChainId.MAINNET)).toBe(false)
    })

    it('disables all chains except current when source is not supported', () => {
      const result = computeDisabledChainIds(
        [MAINNET, GNOSIS, ARBITRUM],
        SupportedChainId.MAINNET,
        new Set([SupportedChainId.GNOSIS_CHAIN]),
        false, // sourceSupported = false
        false,
      )

      expect(result.has(SupportedChainId.GNOSIS_CHAIN)).toBe(true)
      expect(result.has(SupportedChainId.ARBITRUM_ONE)).toBe(true)
      expect(result.has(SupportedChainId.MAINNET)).toBe(false)
    })

    it('disables chains not in destination set when source is supported', () => {
      const destinationIds = new Set([SupportedChainId.MAINNET, SupportedChainId.GNOSIS_CHAIN])
      const result = computeDisabledChainIds(
        [MAINNET, GNOSIS, ARBITRUM],
        SupportedChainId.MAINNET,
        destinationIds,
        true, // sourceSupported = true
        false,
      )

      expect(result.has(SupportedChainId.ARBITRUM_ONE)).toBe(true)
      expect(result.has(SupportedChainId.GNOSIS_CHAIN)).toBe(false)
      expect(result.has(SupportedChainId.MAINNET)).toBe(false)
    })

    it('returns empty set when all chains are valid destinations', () => {
      const destinationIds = new Set([
        SupportedChainId.MAINNET,
        SupportedChainId.GNOSIS_CHAIN,
        SupportedChainId.ARBITRUM_ONE,
      ])
      const result = computeDisabledChainIds(
        [MAINNET, GNOSIS, ARBITRUM],
        SupportedChainId.MAINNET,
        destinationIds,
        true,
        false,
      )

      expect(result.size).toBe(0)
    })
  })

  describe('resolveDefaultChainId', () => {
    it('returns selectedTargetChainId when valid and not disabled', () => {
      const result = resolveDefaultChainId(
        [MAINNET, GNOSIS, ARBITRUM],
        SupportedChainId.GNOSIS_CHAIN,
        SupportedChainId.MAINNET,
        new Set(),
      )

      expect(result).toBe(SupportedChainId.GNOSIS_CHAIN)
    })

    it('falls back to chainId when selectedTargetChainId is disabled', () => {
      const result = resolveDefaultChainId(
        [MAINNET, GNOSIS, ARBITRUM],
        SupportedChainId.GNOSIS_CHAIN,
        SupportedChainId.MAINNET,
        new Set([SupportedChainId.GNOSIS_CHAIN]),
      )

      expect(result).toBe(SupportedChainId.MAINNET)
    })

    it('falls back to chainId when selectedTargetChainId is not in chains list', () => {
      const result = resolveDefaultChainId(
        [MAINNET, ARBITRUM],
        SupportedChainId.GNOSIS_CHAIN,
        SupportedChainId.MAINNET,
        new Set(),
      )

      expect(result).toBe(SupportedChainId.MAINNET)
    })

    it('returns first enabled chain when chainId is not in list', () => {
      const result = resolveDefaultChainId(
        [GNOSIS, ARBITRUM],
        SupportedChainId.BASE,
        SupportedChainId.MAINNET,
        new Set([SupportedChainId.GNOSIS_CHAIN]),
      )

      expect(result).toBe(SupportedChainId.ARBITRUM_ONE)
    })

    it('returns first chain when all are disabled except none exist', () => {
      const result = resolveDefaultChainId(
        [GNOSIS, ARBITRUM],
        SupportedChainId.BASE,
        SupportedChainId.MAINNET,
        new Set([SupportedChainId.GNOSIS_CHAIN, SupportedChainId.ARBITRUM_ONE]),
      )

      expect(result).toBe(SupportedChainId.GNOSIS_CHAIN)
    })

    it('returns chainId when chains list is empty', () => {
      const result = resolveDefaultChainId([], SupportedChainId.BASE, SupportedChainId.MAINNET, new Set())

      expect(result).toBe(SupportedChainId.MAINNET)
    })
  })

  describe('createOutputChainsState', () => {
    const createOptions = (overrides: Partial<CreateOutputChainsOptions> = {}): CreateOutputChainsOptions => ({
      selectedTargetChainId: SupportedChainId.GNOSIS_CHAIN,
      chainId: SupportedChainId.MAINNET,
      currentChainInfo: MAINNET,
      bridgeSupportedNetworks: [MAINNET, GNOSIS, ARBITRUM],
      supportedChains: [MAINNET, GNOSIS, ARBITRUM],
      isLoading: false,
      routesAvailability: {
        unavailableChainIds: new Set(),
        loadingChainIds: new Set(),
        isLoading: false,
      },
      ...overrides,
    })

    it('returns state with ordered chains', () => {
      const result = createOutputChainsState(createOptions())

      expect(result.chains).toBeDefined()
      expect(mockSortChainsByDisplayOrder).toHaveBeenCalled()
    })

    it('adds current chain to list if not present', () => {
      const options = createOptions({
        chainId: SupportedChainId.BASE,
        currentChainInfo: BASE,
        supportedChains: [MAINNET, GNOSIS],
      })

      createOutputChainsState(options)

      expect(mockSortChainsByDisplayOrder).toHaveBeenCalledWith(expect.arrayContaining([MAINNET, GNOSIS, BASE]))
    })

    it('does not duplicate current chain if already present', () => {
      const options = createOptions({
        chainId: SupportedChainId.MAINNET,
        currentChainInfo: MAINNET,
        supportedChains: [MAINNET, GNOSIS],
      })

      createOutputChainsState(options)

      expect(mockSortChainsByDisplayOrder).toHaveBeenCalledWith([MAINNET, GNOSIS])
    })

    it('passes isLoading through to result', () => {
      const result = createOutputChainsState(createOptions({ isLoading: true }))

      expect(result.isLoading).toBe(true)
    })

    it('includes unavailable chain ids in disabled set', () => {
      const unavailableChainIds = new Set([SupportedChainId.ARBITRUM_ONE])
      const result = createOutputChainsState(
        createOptions({
          routesAvailability: {
            unavailableChainIds,
            loadingChainIds: new Set(),
            isLoading: false,
          },
        }),
      )

      expect(result.disabledChainIds?.has(SupportedChainId.ARBITRUM_ONE)).toBe(true)
    })

    it('includes loading chain ids when present', () => {
      const loadingChainIds = new Set([SupportedChainId.GNOSIS_CHAIN])
      const result = createOutputChainsState(
        createOptions({
          routesAvailability: {
            unavailableChainIds: new Set(),
            loadingChainIds,
            isLoading: false,
          },
        }),
      )

      expect(result.loadingChainIds).toEqual(loadingChainIds)
    })

    it('returns undefined for disabledChainIds when empty', () => {
      const result = createOutputChainsState(
        createOptions({
          bridgeSupportedNetworks: [MAINNET, GNOSIS, ARBITRUM],
          supportedChains: [MAINNET, GNOSIS, ARBITRUM],
        }),
      )

      expect(result.disabledChainIds).toBeUndefined()
    })

    it('returns undefined for loadingChainIds when empty', () => {
      const result = createOutputChainsState(createOptions())

      expect(result.loadingChainIds).toBeUndefined()
    })

    it('resolves default chain id correctly', () => {
      const result = createOutputChainsState(
        createOptions({
          selectedTargetChainId: SupportedChainId.GNOSIS_CHAIN,
        }),
      )

      expect(result.defaultChainId).toBe(SupportedChainId.GNOSIS_CHAIN)
    })

    it('handles undefined bridgeSupportedNetworks', () => {
      const result = createOutputChainsState(
        createOptions({
          bridgeSupportedNetworks: undefined,
        }),
      )

      expect(result.chains).toBeDefined()
    })
  })
})
