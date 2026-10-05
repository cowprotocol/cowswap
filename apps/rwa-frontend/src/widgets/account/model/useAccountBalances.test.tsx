import { createStore, Provider } from 'jotai'
import type { ReactNode } from 'react'

import { QueryClient } from '@tanstack/query-core'

import { getAddressKey } from '@cowprotocol/cow-sdk'

import { renderHook, waitFor } from '@testing-library/react'
import { queryClientAtom } from 'jotai-tanstack-query'

import { loadChainBalances } from './loadChainBalances'
import { useAccountBalances } from './useAccountBalances'
import { type ChainBalancesCallbacks, watchChainBalances } from './watchChainBalances'

import { AAPLX_MAINNET, OWNER } from '../lib/fixtures'

import type { RwaToken, RwaTokenList } from '@/entities/asset'

jest.mock('./loadChainBalances', () => ({ loadChainBalances: jest.fn() }))
jest.mock('./watchChainBalances', () => ({ watchChainBalances: jest.fn() }))

const loadChainBalancesMock = loadChainBalances as jest.Mock
const watchChainBalancesMock = watchChainBalances as jest.Mock

const CHAIN_IDS = [1, 56, 100, 137, 8453, 42161, 43114]
const TOKENS: RwaToken[] = CHAIN_IDS.map((chainId) => ({ ...AAPLX_MAINNET, chainId }))
const TOKEN_KEY = getAddressKey(AAPLX_MAINNET.address)
const TOKEN_LIST: RwaTokenList = {
  name: 'RWA',
  timestamp: '2026-10-01T00:00:00.000Z',
  version: { major: 1, minor: 0, patch: 0 },
  tokens: [],
}

describe('useAccountBalances', () => {
  beforeEach(() => {
    global.fetch = jest.fn().mockResolvedValue({ ok: true, status: 200, json: () => Promise.resolve(TOKEN_LIST) })
    loadChainBalancesMock.mockReset().mockResolvedValue({ [TOKEN_KEY]: '2' })
    watchChainBalancesMock
      .mockReset()
      .mockImplementation(
        (_chainId: number, _owner: string, _list: RwaTokenList, callbacks: ChainBalancesCallbacks) => {
          callbacks.onBalances({ [TOKEN_KEY]: '1' })

          return jest.fn()
        },
      )
  })

  it('streams the chains that fit in the connection limit and loads the others once', async () => {
    const store = createStore()
    store.set(queryClientAtom, new QueryClient({ defaultOptions: { queries: { retry: false } } }))
    const wrapper = ({ children }: { children: ReactNode }): ReactNode => <Provider store={store}>{children}</Provider>

    const { result } = renderHook(() => useAccountBalances(OWNER, TOKENS), { wrapper })

    await waitFor(() => expect(result.current.positions).toHaveLength(CHAIN_IDS.length))

    expect(watchChainBalancesMock.mock.calls.map(([chainId]) => chainId)).toEqual([1, 56, 100, 137, 8453])
    expect(loadChainBalancesMock.mock.calls.map(([chainId]) => chainId).sort()).toEqual([42161, 43114])
    expect(result.current.positions?.map(({ token, balance }) => [token.chainId, balance])).toEqual(
      CHAIN_IDS.map((chainId) => [chainId, chainId === 42161 || chainId === 43114 ? '2' : '1']),
    )
    expect(result.current.failedChainIds).toEqual([])
  })
})
