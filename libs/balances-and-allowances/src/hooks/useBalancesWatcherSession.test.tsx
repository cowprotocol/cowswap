import { Provider, useAtomValue } from 'jotai'
import { useHydrateAtoms } from 'jotai/utils'
import React, { ReactNode } from 'react'

import { NATIVE_CURRENCY_ADDRESS } from '@cowprotocol/common-const'
import { getAddressKey, SupportedChainId } from '@cowprotocol/cow-sdk'

import { act, renderHook } from '@testing-library/react'

import { useBalancesWatcherSession, UseBalancesWatcherSessionParams } from './useBalancesWatcherSession'

import { BalancesSubscription, BalancesWatcherApiError, SubscribeToBalancesEventsParams } from '../balancesWatcher'
import { balancesAtom, BalancesState, DEFAULT_BALANCES_STATE } from '../state/balancesAtom'

jest.mock('../balancesWatcher', () => {
  const actual = jest.requireActual('../balancesWatcher')
  return {
    ...actual,
    createBalancesWatcherSession: jest.fn(),
    subscribeToBalancesEvents: jest.fn(),
  }
})

const balancesWatcherModule = jest.requireMock('../balancesWatcher') as {
  createBalancesWatcherSession: jest.Mock
  subscribeToBalancesEvents: jest.Mock
}
const mockCreateSession = balancesWatcherModule.createBalancesWatcherSession
const mockSubscribe = balancesWatcherModule.subscribeToBalancesEvents

interface Deferred<T> {
  promise: Promise<T>
  resolve: (value: T) => void
  reject: (reason?: unknown) => void
}

function deferred<T>(): Deferred<T> {
  let resolve!: (value: T) => void
  let reject!: (reason?: unknown) => void
  const promise = new Promise<T>((res, rej) => {
    resolve = res
    reject = rej
  })
  return { promise, resolve, reject }
}

const ACCOUNT = '0x1234567890123456789012345678901234567890'
const TOKEN_A = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'
const TOKEN_B = '0xdAC17F958D2ee523a2206206994597C13D831ec7'

function makeParams(overrides: Partial<UseBalancesWatcherSessionParams> = {}): UseBalancesWatcherSessionParams {
  return {
    account: ACCOUNT,
    chainId: SupportedChainId.MAINNET,
    tokensListsUrls: ['https://example.com/tokens.json'],
    customTokens: [],
    ...overrides,
  }
}

let currentInitialBalances: BalancesState = DEFAULT_BALANCES_STATE

function HydrateAtoms({ children }: { children: ReactNode }): ReactNode {
  useHydrateAtoms([[balancesAtom, currentInitialBalances]])
  return <>{children}</>
}

function Wrapper({ children }: { children: ReactNode }): ReactNode {
  return (
    <Provider>
      <HydrateAtoms>{children}</HydrateAtoms>
    </Provider>
  )
}

function renderSession(
  initialParams: UseBalancesWatcherSessionParams = makeParams(),
  initialBalances: BalancesState = DEFAULT_BALANCES_STATE,
): ReturnType<typeof renderHook<BalancesState, { params: UseBalancesWatcherSessionParams }>> {
  currentInitialBalances = initialBalances
  return renderHook(
    ({ params }: { params: UseBalancesWatcherSessionParams }) => {
      useBalancesWatcherSession(params)
      return useAtomValue(balancesAtom)
    },
    { wrapper: Wrapper, initialProps: { params: initialParams } },
  )
}

function capturedSubscribeParams(): SubscribeToBalancesEventsParams {
  const calls = mockSubscribe.mock.calls
  expect(calls.length).toBeGreaterThan(0)
  return calls[calls.length - 1][0] as SubscribeToBalancesEventsParams
}

describe('useBalancesWatcherSession', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockCreateSession.mockReturnValue(Promise.resolve())
    mockSubscribe.mockReturnValue({ close: jest.fn() } satisfies BalancesSubscription)
  })

  it('does not create a session when account is undefined', () => {
    renderSession(makeParams({ account: undefined }))

    expect(mockCreateSession).not.toHaveBeenCalled()
    expect(mockSubscribe).not.toHaveBeenCalled()
  })

  it('does not create a session when both lists and customTokens are empty', () => {
    renderSession(makeParams({ tokensListsUrls: [], customTokens: [] }))

    expect(mockCreateSession).not.toHaveBeenCalled()
  })

  it('does not create a session for a non-EVM chain (Solana)', () => {
    renderSession(makeParams({ chainId: SupportedChainId.SOLANA }))

    expect(mockCreateSession).not.toHaveBeenCalled()
  })

  it('creates a session with the expected body and subscribes after it resolves', async () => {
    const session = deferred<void>()
    mockCreateSession.mockReturnValueOnce(session.promise)

    renderSession(makeParams({ customTokens: [getAddressKey(TOKEN_A)] }))

    expect(mockCreateSession).toHaveBeenCalledTimes(1)
    expect(mockCreateSession).toHaveBeenCalledWith({
      chainId: SupportedChainId.MAINNET,
      owner: ACCOUNT,
      body: {
        tokensListsUrls: ['https://example.com/tokens.json'],
        customTokens: [getAddressKey(TOKEN_A)],
      },
    })
    expect(mockSubscribe).not.toHaveBeenCalled()

    await act(async () => {
      session.resolve()
    })

    expect(mockSubscribe).toHaveBeenCalledTimes(1)
    expect(capturedSubscribeParams()).toMatchObject({
      chainId: SupportedChainId.MAINNET,
      owner: ACCOUNT,
    })
  })

  it('writes the snapshot into balancesAtom (bigint values, normalized address keys, first-load flags)', async () => {
    const session = deferred<void>()
    mockCreateSession.mockReturnValueOnce(session.promise)

    const { result } = renderSession()

    await act(async () => {
      session.resolve()
    })

    await act(async () => {
      capturedSubscribeParams().onBalances({
        [NATIVE_CURRENCY_ADDRESS]: '1000000000000000000',
        [TOKEN_A]: '500',
      })
    })

    expect(result.current.values[getAddressKey(NATIVE_CURRENCY_ADDRESS)]).toBe(1000000000000000000n)
    expect(result.current.values[getAddressKey(TOKEN_A)]).toBe(500n)
    expect(result.current.hasFirstLoad).toBe(true)
    expect(result.current.isLoading).toBe(false)
    expect(result.current.fromCache).toBe(false)
    expect(result.current.error).toBeNull()
    expect(result.current.chainId).toBe(SupportedChainId.MAINNET)
  })

  it('merges a diff into balancesAtom without clearing prior keys', async () => {
    const session = deferred<void>()
    mockCreateSession.mockReturnValueOnce(session.promise)

    const { result } = renderSession()

    await act(async () => {
      session.resolve()
    })
    const sub = capturedSubscribeParams()

    await act(async () => {
      sub.onBalances({ [TOKEN_A]: '100', [TOKEN_B]: '200' })
    })
    await act(async () => {
      sub.onBalances({ [TOKEN_B]: '999' })
    })

    expect(result.current.values[getAddressKey(TOKEN_A)]).toBe(100n)
    expect(result.current.values[getAddressKey(TOKEN_B)]).toBe(999n)
  })

  it('writes the atom error and clears isLoading on a terminal SSE error', async () => {
    const session = deferred<void>()
    mockCreateSession.mockReturnValueOnce(session.promise)

    const { result } = renderSession()

    await act(async () => {
      session.resolve()
    })
    const sub = capturedSubscribeParams()

    await act(async () => {
      sub.onError(new Error('stream closed by server'), true)
    })

    expect(result.current.error).toBe('stream closed by server')
    expect(result.current.isLoading).toBe(false)
    // First-load gate must close even on error, otherwise form validation
    // keeps the UI in BalancesLoading forever (see useTradeFormValidationContext).
    expect(result.current.hasFirstLoad).toBe(true)
  })

  it('ignores non-terminal SSE errors (transport is reconnecting)', async () => {
    const session = deferred<void>()
    mockCreateSession.mockReturnValueOnce(session.promise)

    const { result } = renderSession()

    await act(async () => {
      session.resolve()
    })
    const sub = capturedSubscribeParams()

    await act(async () => {
      sub.onError(new Error('transient'), false)
    })

    expect(result.current.error).toBeNull()
  })

  it('writes the atom error and clears isLoading when createSession rejects', async () => {
    const session = deferred<void>()
    mockCreateSession.mockReturnValueOnce(session.promise)

    const { result } = renderSession()

    await act(async () => {
      session.reject(new BalancesWatcherApiError(503, { code: 1, message: 'service unavailable' }))
    })

    expect(result.current.error).toBe('service unavailable')
    expect(result.current.isLoading).toBe(false)
    expect(result.current.hasFirstLoad).toBe(true)
    expect(mockSubscribe).not.toHaveBeenCalled()
  })

  it('closes the subscription on unmount and ignores late events', async () => {
    const session = deferred<void>()
    mockCreateSession.mockReturnValueOnce(session.promise)
    const close = jest.fn()
    mockSubscribe.mockReturnValueOnce({ close })

    const { result, unmount } = renderSession()

    await act(async () => {
      session.resolve()
    })
    const sub = capturedSubscribeParams()

    unmount()
    expect(close).toHaveBeenCalledTimes(1)

    await act(async () => {
      sub.onBalances({ [TOKEN_A]: '777' })
    })
    expect(result.current.values[getAddressKey(TOKEN_A)]).toBeUndefined()
  })

  it('discards a session whose POST resolves after a chainId change (race-guard)', async () => {
    const stale = deferred<void>()
    const fresh = deferred<void>()
    mockCreateSession.mockReturnValueOnce(stale.promise).mockReturnValueOnce(fresh.promise)

    const { result, rerender } = renderSession(makeParams({ chainId: SupportedChainId.MAINNET }))

    rerender({ params: makeParams({ chainId: SupportedChainId.ARBITRUM_ONE }) })

    // Stale chain=1 session resolves first; it must NOT open a subscription.
    await act(async () => {
      stale.resolve()
    })
    expect(mockSubscribe).not.toHaveBeenCalled()

    // Fresh chain=42161 session resolves; subscription opens for that chain.
    await act(async () => {
      fresh.resolve()
    })
    expect(mockSubscribe).toHaveBeenCalledTimes(1)
    expect(capturedSubscribeParams().chainId).toBe(SupportedChainId.ARBITRUM_ONE)

    await act(async () => {
      capturedSubscribeParams().onBalances({ [TOKEN_A]: '42' })
    })
    expect(result.current.chainId).toBe(SupportedChainId.ARBITRUM_ONE)
    expect(result.current.values[getAddressKey(TOKEN_A)]).toBe(42n)
  })
})
