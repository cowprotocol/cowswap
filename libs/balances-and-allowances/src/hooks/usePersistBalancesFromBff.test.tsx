import { Provider } from 'jotai'
import { useHydrateAtoms } from 'jotai/utils'
import React, { ReactNode } from 'react'

import { mapSupportedNetworks, SupportedChainId } from '@cowprotocol/cow-sdk'
import { PersistentStateByChain } from '@cowprotocol/types'

import { renderHook } from '@testing-library/react'
import fetchMock from 'jest-fetch-mock'
import useSWR, { SWRConfiguration } from 'swr'

// Import the function to test after all mocks are set up
import { PersistBalancesFromBffParams, usePersistBalancesFromBff } from './usePersistBalancesFromBff'

import { balancesAtom, BalancesState, balancesUpdateAtom } from '../state/balancesAtom'
import * as isBffFailedAtom from '../state/isBffFailedAtom'
import * as bffUtils from '../utils/isBffSupportedNetwork'

// Enable fetch mocking
fetchMock.enableMocks()

// Mock modules
jest.mock('swr')
jest.mock('../utils/isBffSupportedNetwork')
jest.mock('../state/isBffFailedAtom')

// Create mock for useWalletInfo
const mockUseWalletInfo = jest.fn()

// Mock the wallet module
jest.mock('@cowprotocol/wallet', () => ({
  useWalletInfo: () => mockUseWalletInfo(),
}))

type SWRKey = [string, SupportedChainId, number | undefined, 'bff-balances'] | null
type SWRFetcher = (key: [string, SupportedChainId]) => Promise<Record<string, string> | null>

describe('usePersistBalancesFromBff - balancesSwrConfig and invalidateCacheTrigger', () => {
  const mockSetIsBffFailed = jest.fn()
  const mockWalletInfo = {
    chainId: SupportedChainId.MAINNET,
    account: '0x1234567890123456789012345678901234567890',
  }

  const defaultParams: PersistBalancesFromBffParams = {
    account: '0x1234567890123456789012345678901234567890',
    chainId: SupportedChainId.MAINNET,
    balancesSwrConfig: { refreshInterval: 30000 },
    invalidateCacheTrigger: 0,
    tokenAddresses: ['0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'],
    isEnabled: true,
  }

  const mockBalancesData = {
    '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48': '1000000',
  }

  // Create complete mock data for balancesUpdateAtom
  const mockBalancesUpdate: PersistentStateByChain<Record<string, number | undefined>> = mapSupportedNetworks({})

  const wrapper = ({ children }: { children: ReactNode }): ReactNode => {
    const HydrateAtoms = ({ children }: { children: ReactNode }): ReactNode => {
      useHydrateAtoms([
        [
          balancesAtom,
          {
            isLoading: false,
            chainId: SupportedChainId.MAINNET,
            values: {},
            fromCache: false,
          } as BalancesState,
        ],
        [balancesUpdateAtom, mockBalancesUpdate],
      ])
      return <>{children}</>
    }

    return (
      <Provider>
        <HydrateAtoms>{children}</HydrateAtoms>
      </Provider>
    )
  }

  beforeEach(() => {
    jest.clearAllMocks()
    fetchMock.resetMocks()
    mockUseWalletInfo.mockReturnValue(mockWalletInfo)
    ;(isBffFailedAtom.useSetIsBffFailed as jest.Mock).mockReturnValue(mockSetIsBffFailed)
    ;(bffUtils.isBffSupportedNetwork as jest.Mock).mockReturnValue(true)
  })

  describe('balancesSwrConfig parameter', () => {
    it('should pass custom SWR config to useSWR', () => {
      const customConfig: SWRConfiguration = {
        refreshInterval: 5000,
        dedupingInterval: 2000,
        revalidateOnFocus: false,
        revalidateOnReconnect: true,
        errorRetryCount: 5,
      }

      const mockUseSWR = useSWR as jest.MockedFunction<typeof useSWR>
      mockUseSWR.mockReturnValue({
        data: mockBalancesData,
        error: undefined,
        isLoading: false,
        isValidating: false,
        mutate: jest.fn(),
      } as ReturnType<typeof useSWR>)

      renderHook(() => usePersistBalancesFromBff({ ...defaultParams, balancesSwrConfig: customConfig }), { wrapper })

      expect(mockUseSWR).toHaveBeenCalledWith(
        expect.any(Array),
        expect.any(Function),
        customConfig, // Verify custom config is passed
      )
    })

    it('should handle empty SWR config', () => {
      const emptyConfig = {}

      const mockUseSWR = useSWR as jest.MockedFunction<typeof useSWR>
      mockUseSWR.mockReturnValue({
        data: mockBalancesData,
        error: undefined,
        isLoading: false,
        isValidating: false,
        mutate: jest.fn(),
      } as ReturnType<typeof useSWR>)

      renderHook(() => usePersistBalancesFromBff({ ...defaultParams, balancesSwrConfig: emptyConfig }), { wrapper })

      expect(mockUseSWR).toHaveBeenCalledWith(expect.any(Array), expect.any(Function), emptyConfig)
    })

    it('should respect isPaused function in SWR config', () => {
      const pausedConfig: SWRConfiguration = {
        isPaused: () => true,
        refreshInterval: 1000,
      }

      const mockUseSWR = useSWR as jest.MockedFunction<typeof useSWR>
      mockUseSWR.mockReturnValue({
        data: undefined,
        error: undefined,
        isLoading: false,
        isValidating: false,
        mutate: jest.fn(),
      } as ReturnType<typeof useSWR>)

      renderHook(() => usePersistBalancesFromBff({ ...defaultParams, balancesSwrConfig: pausedConfig }), { wrapper })

      expect(mockUseSWR).toHaveBeenCalledWith(expect.any(Array), expect.any(Function), pausedConfig)
    })
  })

  describe('invalidateCacheTrigger parameter', () => {
    it('should trigger cache invalidation when value changes', async () => {
      const mockUseSWR = useSWR as jest.MockedFunction<typeof useSWR>

      mockUseSWR.mockImplementation((key, fetcher, _config) => {
        if (key && fetcher) {
          Promise.resolve(fetcher(key as [string, SupportedChainId])).catch(() => {})
        }
        return {
          data: mockBalancesData,
          error: undefined,
          isLoading: false,
          isValidating: false,
          mutate: jest.fn(),
        } as ReturnType<typeof useSWR>
      })
      fetchMock.mockResolvedValue({
        ok: true,
        json: async () => ({ balances: mockBalancesData }),
      } as Response)

      const { rerender } = renderHook(
        ({ trigger }: { trigger: number }) =>
          usePersistBalancesFromBff({ ...defaultParams, invalidateCacheTrigger: trigger }),
        {
          wrapper,
          initialProps: { trigger: 0 },
        },
      )

      // Initial call with trigger = 0
      expect(mockUseSWR).toHaveBeenCalledWith(
        [defaultParams.account, defaultParams.chainId, 0, 'bff-balances'],
        expect.any(Function),
        expect.any(Object),
      )

      // Change trigger to force cache invalidation
      rerender({ trigger: 1 })

      expect(mockUseSWR).toHaveBeenCalledWith(
        [defaultParams.account, defaultParams.chainId, 1, 'bff-balances'],
        expect.any(Function),
        expect.any(Object),
      )

      // Change trigger again
      rerender({ trigger: 5 })

      expect(mockUseSWR).toHaveBeenCalledWith(
        [defaultParams.account, defaultParams.chainId, 5, 'bff-balances'],
        expect.any(Function),
        expect.any(Object),
      )
    })

    it('should handle undefined invalidateCacheTrigger', () => {
      const mockUseSWR = useSWR as jest.MockedFunction<typeof useSWR>
      mockUseSWR.mockReturnValue({
        data: mockBalancesData,
        error: undefined,
        isLoading: false,
        isValidating: false,
        mutate: jest.fn(),
      } as ReturnType<typeof useSWR>)

      const paramsWithoutTrigger: Omit<PersistBalancesFromBffParams, 'invalidateCacheTrigger'> = {
        account: defaultParams.account,
        chainId: defaultParams.chainId,
        balancesSwrConfig: defaultParams.balancesSwrConfig,
        tokenAddresses: defaultParams.tokenAddresses,
        isEnabled: defaultParams.isEnabled,
      }

      renderHook(() => usePersistBalancesFromBff(paramsWithoutTrigger as PersistBalancesFromBffParams), { wrapper })

      expect(mockUseSWR).toHaveBeenCalledWith(
        [defaultParams.account, defaultParams.chainId, undefined, 'bff-balances'],
        expect.any(Function),
        expect.any(Object),
      )
    })

    it('should maintain trigger value across rerenders when not changed', () => {
      const mockUseSWR = useSWR as jest.MockedFunction<typeof useSWR>
      mockUseSWR.mockReturnValue({
        data: mockBalancesData,
        error: undefined,
        isLoading: false,
        isValidating: false,
        mutate: jest.fn(),
      } as ReturnType<typeof useSWR>)

      const { rerender } = renderHook<
        void,
        {
          invalidateCacheTrigger: number
          isEnabled?: boolean
        }
      >((props) => usePersistBalancesFromBff({ ...defaultParams, ...props }), {
        wrapper,
        initialProps: { invalidateCacheTrigger: 3 },
      })

      // Rerender with same trigger value but different prop
      rerender({ invalidateCacheTrigger: 3, isEnabled: false })
      rerender({ invalidateCacheTrigger: 3, isEnabled: true })

      // All calls should have the same trigger value
      const calls = (mockUseSWR as jest.Mock).mock.calls
      const triggersFromCalls = calls
        .filter((call: [SWRKey, SWRFetcher | undefined, SWRConfiguration | undefined]) => call[0] !== null)
        .map((call: [SWRKey, SWRFetcher | undefined, SWRConfiguration | undefined]) => call[0]?.[2])

      expect(triggersFromCalls).toEqual([3, 3])
    })
  })

  describe('balancesSwrConfig and invalidateCacheTrigger interaction', () => {
    it('should apply both custom config and trigger changes', () => {
      const customConfig: SWRConfiguration = {
        refreshInterval: 10000,
        revalidateOnFocus: true,
      }

      const mockUseSWR = useSWR as jest.MockedFunction<typeof useSWR>
      mockUseSWR.mockReturnValue({
        data: mockBalancesData,
        error: undefined,
        isLoading: false,
        isValidating: false,
        mutate: jest.fn(),
      } as ReturnType<typeof useSWR>)

      const { rerender } = renderHook(
        ({ trigger }: { trigger: number }) =>
          usePersistBalancesFromBff({
            ...defaultParams,
            balancesSwrConfig: customConfig,
            invalidateCacheTrigger: trigger,
          }),
        {
          wrapper,
          initialProps: { trigger: 0 },
        },
      )

      expect(mockUseSWR).toHaveBeenCalledWith(
        [defaultParams.account, defaultParams.chainId, 0, 'bff-balances'],
        expect.any(Function),
        customConfig,
      )

      rerender({ trigger: 2 })

      expect(mockUseSWR).toHaveBeenLastCalledWith(
        [defaultParams.account, defaultParams.chainId, 2, 'bff-balances'],
        expect.any(Function),
        customConfig,
      )
    })
  })
})
