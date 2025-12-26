import { Provider, useAtomValue } from 'jotai'
import { useHydrateAtoms } from 'jotai/utils'
import React, { ReactNode } from 'react'

import { mapSupportedNetworks, SupportedChainId } from '@cowprotocol/cow-sdk'
import { PersistentStateByChain } from '@cowprotocol/types'

import { renderHook, waitFor } from '@testing-library/react'
import fetchMock from 'jest-fetch-mock'
import useSWR from 'swr'

// Import the function to test after all mocks are set up
import { PersistBalancesFromBffParams, usePersistBalancesFromBff } from './usePersistBalancesFromBff'

import { BFF_BALANCES_SWR_CONFIG } from '../constants/bff-balances-swr-config'
import { balancesAtom, BalancesState, balancesUpdateAtom } from '../state/balancesAtom'
import { bffUnsupportedChainsAtom } from '../state/isBffFailedAtom'
import { UnsupportedChainError } from '../utils/UnsupportedChainError'

// Enable fetch mocking
fetchMock.enableMocks()

// Mock modules
jest.mock('swr')

// Create mock for useWalletInfo
const mockUseWalletInfo = jest.fn()

// Mock the wallet module
jest.mock('@cowprotocol/wallet', () => ({
  useWalletInfo: () => mockUseWalletInfo(),
}))

describe('usePersistBalancesFromBff - invalidateCacheTrigger', () => {
  const mockWalletInfo = {
    chainId: SupportedChainId.MAINNET,
    account: '0x1234567890123456789012345678901234567890',
  }

  const defaultParams: PersistBalancesFromBffParams = {
    account: '0x1234567890123456789012345678901234567890',
    chainId: SupportedChainId.MAINNET,
    invalidateCacheTrigger: 0,
    tokenAddresses: ['0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'],
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
        [bffUnsupportedChainsAtom, new Set<SupportedChainId>()],
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
  })

  describe('hardcoded SWR config', () => {
    it('should use hardcoded BFF_BALANCES_SWR_CONFIG', () => {
      const mockUseSWR = useSWR as jest.MockedFunction<typeof useSWR>
      mockUseSWR.mockReturnValue({
        data: mockBalancesData,
        error: undefined,
        isLoading: false,
        isValidating: false,
        mutate: jest.fn(),
      } as ReturnType<typeof useSWR>)

      renderHook(() => usePersistBalancesFromBff(defaultParams), { wrapper })

      expect(mockUseSWR).toHaveBeenCalledWith(
        expect.any(Array),
        expect.any(Function),
        BFF_BALANCES_SWR_CONFIG, // Verify hardcoded config is used
      )
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
        BFF_BALANCES_SWR_CONFIG,
      )

      // Change trigger to force cache invalidation
      rerender({ trigger: 1 })

      expect(mockUseSWR).toHaveBeenCalledWith(
        [defaultParams.account, defaultParams.chainId, 1, 'bff-balances'],
        expect.any(Function),
        BFF_BALANCES_SWR_CONFIG,
      )

      // Change trigger again
      rerender({ trigger: 5 })

      expect(mockUseSWR).toHaveBeenCalledWith(
        [defaultParams.account, defaultParams.chainId, 5, 'bff-balances'],
        expect.any(Function),
        BFF_BALANCES_SWR_CONFIG,
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
        tokenAddresses: defaultParams.tokenAddresses,
      }

      renderHook(() => usePersistBalancesFromBff(paramsWithoutTrigger as PersistBalancesFromBffParams), { wrapper })

      expect(mockUseSWR).toHaveBeenCalledWith(
        [defaultParams.account, defaultParams.chainId, undefined, 'bff-balances'],
        expect.any(Function),
        BFF_BALANCES_SWR_CONFIG,
      )
    })
  })

  describe('unsupported chain handling', () => {
    it('should not make requests for unsupported chains', () => {
      const mockUseSWR = useSWR as jest.MockedFunction<typeof useSWR>
      mockUseSWR.mockReturnValue({
        data: undefined,
        error: undefined,
        isLoading: false,
        isValidating: false,
        mutate: jest.fn(),
      } as ReturnType<typeof useSWR>)

      const unsupportedChainParams: PersistBalancesFromBffParams = {
        ...defaultParams,
        chainId: SupportedChainId.SEPOLIA, // Unsupported network
      }

      renderHook(() => usePersistBalancesFromBff(unsupportedChainParams), { wrapper })

      // Should not make SWR call for unsupported network
      expect(mockUseSWR).toHaveBeenCalledWith(
        null, // Key should be null for unsupported network
        expect.any(Function),
        BFF_BALANCES_SWR_CONFIG,
      )
    })

    it('should add chain to unsupported list when "Unsupported chain" error occurs', async () => {
      const mockUseSWR = useSWR as jest.MockedFunction<typeof useSWR>
      const unsupportedChainError = new UnsupportedChainError()

      mockUseSWR.mockReturnValue({
        data: undefined,
        error: unsupportedChainError,
        isLoading: false,
        isValidating: false,
        mutate: jest.fn(),
      } as ReturnType<typeof useSWR>)

      const useUnsupportedChains = (): Set<SupportedChainId> => {
        usePersistBalancesFromBff(defaultParams)
        return useAtomValue(bffUnsupportedChainsAtom)
      }

      const { result } = renderHook(() => useUnsupportedChains(), { wrapper })

      // Wait for effect to run and add chain to unsupported list
      await waitFor(
        () => {
          expect(result.current.has(defaultParams.chainId)).toBe(true)
        },
        { timeout: 3000 },
      )
    })

    it('should stop making requests after chain is added to unsupported list', () => {
      const mockUseSWR = useSWR as jest.MockedFunction<typeof useSWR>

      const wrapperWithUnsupportedChain = ({ children }: { children: ReactNode }): ReactNode => {
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
            [bffUnsupportedChainsAtom, new Set([SupportedChainId.MAINNET])], // Chain is in unsupported list
          ])
          return <>{children}</>
        }

        return (
          <Provider>
            <HydrateAtoms>{children}</HydrateAtoms>
          </Provider>
        )
      }

      mockUseSWR.mockReturnValue({
        data: undefined,
        error: undefined,
        isLoading: false,
        isValidating: false,
        mutate: jest.fn(),
      } as ReturnType<typeof useSWR>)

      renderHook(() => usePersistBalancesFromBff(defaultParams), { wrapper: wrapperWithUnsupportedChain })

      // Should not make SWR call because chain is in unsupported list
      expect(mockUseSWR).toHaveBeenCalledWith(
        null, // Key should be null
        expect.any(Function),
        BFF_BALANCES_SWR_CONFIG,
      )
    })
  })
})
