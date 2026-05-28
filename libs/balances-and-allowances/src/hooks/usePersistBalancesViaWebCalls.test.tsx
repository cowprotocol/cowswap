import { Provider } from 'jotai'
import { useHydrateAtoms } from 'jotai/utils'
import React, { ReactNode } from 'react'

import { mapSupportedNetworks, SupportedChainId } from '@cowprotocol/cow-sdk'
import { PersistentStateByChain } from '@cowprotocol/types'

import { renderHook } from '@testing-library/react'
import { useReadContracts } from 'wagmi'

import { PersistBalancesAndAllowancesParams, usePersistBalancesViaWebCalls } from './usePersistBalancesViaWebCalls'

import { balancesAtom, BalancesState, balancesUpdateAtom } from '../state/balancesAtom'

jest.mock('wagmi', () => ({
  useReadContracts: jest.fn(),
}))

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
          hasFirstLoad: false,
          error: null,
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

const ACCOUNT = '0x1234567890123456789012345678901234567890'
const TOKEN = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'

function makeParams(
  chainId: SupportedChainId,
  overrides: Partial<PersistBalancesAndAllowancesParams> = {},
): PersistBalancesAndAllowancesParams {
  return {
    account: ACCOUNT,
    chainId,
    tokenAddresses: [TOKEN],
    ...overrides,
  }
}

describe('usePersistBalancesViaWebCalls — non-EVM gating', () => {
  const mockUseReadContracts = useReadContracts as jest.MockedFunction<typeof useReadContracts>

  beforeEach(() => {
    jest.clearAllMocks()
    mockUseReadContracts.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: null,
      dataUpdatedAt: 0,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)
  })

  function lastEnabledArg(): boolean | undefined {
    // First arg of useReadContracts is `{ contracts, query: { enabled, ... } }`.
    // We only care about the boolean computed for `enabled`.
    const calls = mockUseReadContracts.mock.calls
    expect(calls.length).toBeGreaterThan(0)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const firstArg = calls[calls.length - 1][0] as any
    return firstArg?.query?.enabled
  }

  it('enables wagmi query for EVM chains (account + token addresses present)', () => {
    renderHook(() => usePersistBalancesViaWebCalls(makeParams(SupportedChainId.MAINNET)), { wrapper })

    expect(lastEnabledArg()).toBe(true)
  })

  it('enables wagmi query for non-mainnet EVM chains (Arbitrum)', () => {
    renderHook(() => usePersistBalancesViaWebCalls(makeParams(SupportedChainId.ARBITRUM_ONE)), { wrapper })

    expect(lastEnabledArg()).toBe(true)
  })

  it('disables wagmi query for SOLANA — wagmi has no EVM client for non-EVM chains', () => {
    renderHook(() => usePersistBalancesViaWebCalls(makeParams(SupportedChainId.SOLANA)), { wrapper })

    expect(lastEnabledArg()).toBe(false)
  })

  it('does not depend on tokenAddresses being EVM-shaped — gating happens at the chain level', () => {
    // Even with Solana base58 token addresses passed in, the gate short-circuits before
    // wagmi sees the addresses, so no `balanceOf` call is dispatched.
    renderHook(
      () =>
        usePersistBalancesViaWebCalls(
          makeParams(SupportedChainId.SOLANA, {
            tokenAddresses: ['EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'],
          }),
        ),
      { wrapper },
    )

    expect(lastEnabledArg()).toBe(false)
  })

  it('still disables when chainId is Solana even if other prerequisites are met (account + tokens)', () => {
    renderHook(() => usePersistBalancesViaWebCalls(makeParams(SupportedChainId.SOLANA)), { wrapper })

    expect(lastEnabledArg()).toBe(false)
  })
})
