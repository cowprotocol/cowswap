import { createStore, Provider } from 'jotai'
import type { ReactNode } from 'react'

import { useConnection, useSwitchChain } from 'wagmi'

import { renderHook } from '@testing-library/react'

import { tradeChainIdAtom, tradeTokenKeyAtom } from './tradeSelectionAtoms'
import { useTradeTokenFromUrl } from './useTradeTokenFromUrl'

import { getAssetPath, getTokenKey, type RwaToken } from '@/entities/asset'

jest.mock('wagmi', () => ({ useConnection: jest.fn(), useSwitchChain: jest.fn() }))

const MAINNET_TOKEN = { chainId: 1, address: '0x00000000000000000000000000000000000000AA' } as RwaToken
const BASE_TOKEN = { chainId: 8453, address: '0x00000000000000000000000000000000000000bB' } as RwaToken
const BASE_TOKEN_PATH = getAssetPath('NVDA', { token: BASE_TOKEN, from: 'portfolio' })

interface Rendered {
  store: ReturnType<typeof createStore>
  switchChain: jest.Mock
  rerender(): void
}

function renderAtPath(path: string, connection: { status: string; chainId?: number }): Rendered {
  window.history.replaceState(null, '', path)
  const switchChain = jest.fn()
  jest.mocked(useConnection).mockReturnValue(connection as ReturnType<typeof useConnection>)
  jest.mocked(useSwitchChain).mockReturnValue({ mutate: switchChain } as unknown as ReturnType<typeof useSwitchChain>)
  const store = createStore()
  const wrapper = ({ children }: { children: ReactNode }): ReactNode => <Provider store={store}>{children}</Provider>
  const { rerender } = renderHook(() => useTradeTokenFromUrl([MAINNET_TOKEN, BASE_TOKEN]), { wrapper })

  return { store, switchChain, rerender }
}

afterEach(() => window.history.replaceState(null, '', '/'))

describe('useTradeTokenFromUrl', () => {
  it('selects the token and switches the wallet to its network', () => {
    const { store, switchChain } = renderAtPath(BASE_TOKEN_PATH, { status: 'connected', chainId: 1 })

    expect(store.get(tradeTokenKeyAtom)).toBe(getTokenKey(BASE_TOKEN))
    expect(store.get(tradeChainIdAtom)).toBe(8453)
    expect(switchChain).toHaveBeenCalledWith({ chainId: 8453 }, expect.anything())
  })

  it('falls back to the default selection when the wallet does not switch', () => {
    const { store, switchChain } = renderAtPath(BASE_TOKEN_PATH, { status: 'connected', chainId: 1 })

    switchChain.mock.calls[0][1].onError(new Error('Unsupported chain'))

    expect(store.get(tradeTokenKeyAtom)).toBe(null)
    expect(store.get(tradeChainIdAtom)).toBe(null)
  })

  it('keeps a token picked while the switch was pending', () => {
    const { store, switchChain } = renderAtPath(BASE_TOKEN_PATH, { status: 'connected', chainId: 1 })

    store.set(tradeChainIdAtom, 1)
    store.set(tradeTokenKeyAtom, getTokenKey(MAINNET_TOKEN))
    switchChain.mock.calls[0][1].onError(new Error('User rejected the request'))

    expect(store.get(tradeTokenKeyAtom)).toBe(getTokenKey(MAINNET_TOKEN))
    expect(store.get(tradeChainIdAtom)).toBe(1)
  })

  it('selects the token without a switch for a disconnected wallet', () => {
    const { store, switchChain } = renderAtPath(BASE_TOKEN_PATH, { status: 'disconnected' })

    expect(store.get(tradeTokenKeyAtom)).toBe(getTokenKey(BASE_TOKEN))
    expect(switchChain).not.toHaveBeenCalled()
  })

  it('waits for the wallet to reconnect, then applies the token once', () => {
    const { store, switchChain, rerender } = renderAtPath(BASE_TOKEN_PATH, { status: 'reconnecting' })

    expect(store.get(tradeTokenKeyAtom)).toBe(null)

    jest.mocked(useConnection).mockReturnValue({ status: 'connected', chainId: 1 } as ReturnType<typeof useConnection>)
    rerender()
    jest.mocked(useConnection).mockReturnValue({ status: 'connected', chainId: 10 } as ReturnType<typeof useConnection>)
    rerender()

    expect(store.get(tradeTokenKeyAtom)).toBe(getTokenKey(BASE_TOKEN))
    expect(switchChain).toHaveBeenCalledTimes(1)
  })

  it.each([getAssetPath('NVDA'), '/asset/NVDA?token=10:0xunknown'])('keeps the default selection at %s', (path) => {
    const { store, switchChain } = renderAtPath(path, { status: 'connected', chainId: 1 })

    expect(store.get(tradeTokenKeyAtom)).toBe(null)
    expect(store.get(tradeChainIdAtom)).toBe(null)
    expect(switchChain).not.toHaveBeenCalled()
  })
})
