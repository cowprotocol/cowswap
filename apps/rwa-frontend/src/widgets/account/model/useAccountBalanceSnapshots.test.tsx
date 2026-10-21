import { createStore, Provider } from 'jotai'
import type { ReactNode } from 'react'

import { QueryClient } from '@tanstack/query-core'

import { getAddressKey } from '@cowprotocol/cow-sdk'

import { act, renderHook, waitFor } from '@testing-library/react'
import { queryClientAtom } from 'jotai-tanstack-query'

import { loadChainBalances } from './loadChainBalances'
import { useAccountBalanceSnapshots } from './useAccountBalanceSnapshots'

import { AAPLX_MAINNET, OWNER } from '../lib/fixtures'

import type { RwaTokenList } from '@/entities/asset'

jest.mock('./loadChainBalances', () => ({ loadChainBalances: jest.fn() }))

const loadChainBalancesMock = loadChainBalances as jest.Mock
const TOKENS = [AAPLX_MAINNET]
const TOKEN_LIST: RwaTokenList = {
  name: 'RWA',
  timestamp: '2026-10-01T00:00:00.000Z',
  version: { major: 1, minor: 0, patch: 0 },
  tokens: [],
}

function renderSnapshots(): ReturnType<typeof renderHook<ReturnType<typeof useAccountBalanceSnapshots>, unknown>> {
  const store = createStore()
  store.set(queryClientAtom, new QueryClient({ defaultOptions: { queries: { retry: false } } }))
  const wrapper = ({ children }: { children: ReactNode }): ReactNode => <Provider store={store}>{children}</Provider>

  return renderHook(() => useAccountBalanceSnapshots(OWNER, TOKENS), { wrapper })
}

function response(ok: boolean, body: unknown): object {
  return { ok, status: ok ? 200 : 500, json: () => Promise.resolve(body) }
}

describe('useAccountBalanceSnapshots', () => {
  beforeEach(() => {
    loadChainBalancesMock.mockReset().mockResolvedValue({ [getAddressKey(AAPLX_MAINNET.address)]: '5' })
  })

  it('reports loading while the token list is pending', async () => {
    global.fetch = jest.fn(() => new Promise<Response>(() => undefined))

    const { result } = renderSnapshots()

    await waitFor(() => expect(result.current.isFetching).toBe(true))
    expect(loadChainBalancesMock).not.toHaveBeenCalled()
  })

  it('opens one watcher session per chain once the token list loads', async () => {
    global.fetch = jest.fn().mockResolvedValue(response(true, TOKEN_LIST))

    const { result } = renderSnapshots()

    await waitFor(() => expect(result.current.positions).toEqual([{ token: AAPLX_MAINNET, balance: '5' }]))
    expect(loadChainBalancesMock).toHaveBeenCalledTimes(1)
  })

  it('refetches a failed token list on refresh, then loads the balances', async () => {
    global.fetch = jest
      .fn()
      .mockResolvedValueOnce(response(false, { error: 'Token list is down' }))
      .mockResolvedValue(response(true, TOKEN_LIST))

    const { result } = renderSnapshots()

    await waitFor(() => expect(result.current.error?.message).toBe('Token list is down'))
    expect(result.current.isFetching).toBe(false)

    act(() => result.current.refresh())

    await waitFor(() => expect(result.current.positions).toEqual([{ token: AAPLX_MAINNET, balance: '5' }]))
  })
})
