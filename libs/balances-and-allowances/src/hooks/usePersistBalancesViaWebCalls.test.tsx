import { Provider } from 'jotai'
import { useHydrateAtoms } from 'jotai/utils'
import React, { ReactNode } from 'react'

import { useReadContracts } from 'wagmi'

import { mapSupportedNetworks, SupportedChainId } from '@cowprotocol/cow-sdk'
import { PersistentStateByChain } from '@cowprotocol/types'

import { renderHook } from '@testing-library/react'

import { PersistBalancesAndAllowancesParams, usePersistBalancesViaWebCalls } from './usePersistBalancesViaWebCalls'

import { balancesAtom, BalancesState, balancesUpdateAtom } from '../state/balancesAtom'
import { reportBalancesError } from '../utils/reportBalancesError'

jest.mock('wagmi', () => ({
  useReadContracts: jest.fn(),
}))

// The Solana path has its own dedicated test; stub it here so this suite stays focused on
// EVM wagmi gating and avoids pulling in the reown/web3/react-query runtime.
jest.mock('./usePersistSolanaBalancesViaWebCalls', () => ({
  usePersistSolanaBalancesViaWebCalls: jest.fn(),
}))

jest.mock('../utils/reportBalancesError', () => ({
  REPORT_THROTTLE_MS: 0,
  reportBalancesError: jest.fn(),
}))

// Freshness gating has its own logic; keep this suite deterministic.
jest.mock('./useIsBlockNumberRelevant', () => ({
  useIsBlockNumberRelevant: () => true,
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
const TOKEN_2 = '0x6B175474E89094C44Da98b954EedeAC495271d0F'

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

describe('usePersistBalancesViaWebCalls — transport-level multicall failures', () => {
  const mockUseReadContracts = useReadContracts as jest.MockedFunction<typeof useReadContracts>
  const mockReportBalancesError = reportBalancesError as jest.MockedFunction<typeof reportBalancesError>

  function mockReadContractsResult(data: unknown): void {
    mockUseReadContracts.mockReturnValue({
      data,
      isLoading: false,
      error: null,
      dataUpdatedAt: Date.now(),
    } as unknown as ReturnType<typeof useReadContracts>)
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('reports the underlying error when every call failed — viem allowFailure swallows dead-RPC errors', () => {
    const transportError = new Error('HTTP request failed')
    mockReadContractsResult([
      { status: 'failure', error: transportError, result: undefined },
      { status: 'failure', error: transportError, result: undefined },
    ])
    const onBalancesLoaded = jest.fn()

    renderHook(
      () =>
        usePersistBalancesViaWebCalls(
          makeParams(SupportedChainId.MAINNET, { tokenAddresses: [TOKEN, TOKEN_2], onBalancesLoaded }),
        ),
      { wrapper },
    )

    expect(mockReportBalancesError).toHaveBeenCalledWith(
      expect.objectContaining({ error: transportError, chainId: SupportedChainId.MAINNET, tokensCount: 2 }),
    )
    // A result set with no data must not be presented as a successful load
    expect(onBalancesLoaded).not.toHaveBeenCalled()
  })

  it('does not report partial failures — individual broken tokens are expected noise', () => {
    mockReadContractsResult([
      { status: 'success', result: 1n },
      { status: 'failure', error: new Error('execution reverted'), result: undefined },
    ])
    const onBalancesLoaded = jest.fn()

    renderHook(
      () =>
        usePersistBalancesViaWebCalls(
          makeParams(SupportedChainId.MAINNET, { tokenAddresses: [TOKEN, TOKEN_2], onBalancesLoaded }),
        ),
      { wrapper },
    )

    expect(mockReportBalancesError).not.toHaveBeenCalled()
    expect(onBalancesLoaded).toHaveBeenCalledWith(true)
  })
})
