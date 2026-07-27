import { createStore, Provider } from 'jotai'
import { ReactNode } from 'react'

import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { useWalletInfo } from '@cowprotocol/wallet'

import { act, renderHook } from '@testing-library/react'

import { useLoadMoreEoaTwapOrders } from './useLoadMoreEoaTwapOrders'

import { eoaTwapOrdersRequestAtom } from '../state/eoaTwapOrdersRequestAtom'

jest.mock('@cowprotocol/wallet', () => ({
  ...jest.requireActual('@cowprotocol/wallet'),
  useWalletInfo: jest.fn(),
}))

const OWNER = '0x1111111111111111111111111111111111111111'
const CHAIN_ID = SupportedChainId.GNOSIS_CHAIN
const REQUEST_KEY = `${CHAIN_ID}:${OWNER}`
const useWalletInfoMock = useWalletInfo as jest.MockedFunction<typeof useWalletInfo>

describe('useLoadMoreEoaTwapOrders', () => {
  beforeEach(() => {
    useWalletInfoMock.mockReturnValue({ account: OWNER, chainId: CHAIN_ID })
  })

  it('loads 100 more parents and stops at 1000', () => {
    const store = createStore()
    store.set(eoaTwapOrdersRequestAtom, {
      requestKey: REQUEST_KEY,
      limit: 100,
      isLoading: false,
      totalCount: 1000,
    })
    const { result } = renderHook(() => useLoadMoreEoaTwapOrders(), { wrapper: testWrapper(store) })

    expect(result.current.hasMoreOrders).toBe(true)
    act(() => result.current.loadMore())
    expect(result.current).toMatchObject({ limit: 200, isLoading: true })

    act(() => {
      store.set(eoaTwapOrdersRequestAtom, {
        requestKey: REQUEST_KEY,
        limit: 1000,
        isLoading: false,
        totalCount: 1000,
      })
    })
    expect(result.current).toMatchObject({ limit: 1000, hasMoreOrders: false })
    act(() => result.current.loadMore())
    expect(result.current.limit).toBe(1000)
  })

  it('resets the visible request window for a different owner key', () => {
    const store = createStore()
    store.set(eoaTwapOrdersRequestAtom, {
      requestKey: REQUEST_KEY,
      limit: 500,
      isLoading: false,
      totalCount: 1000,
    })
    useWalletInfoMock.mockReturnValue({ account: OWNER.replace(/1/g, '2'), chainId: CHAIN_ID })

    const { result } = renderHook(() => useLoadMoreEoaTwapOrders(), { wrapper: testWrapper(store) })

    expect(result.current).toMatchObject({ limit: 100, isLoading: false, hasMoreOrders: false })
  })
})

function testWrapper(store: ReturnType<typeof createStore>): ({ children }: { children: ReactNode }) => ReactNode {
  return function TestWrapper({ children }: { children: ReactNode }): ReactNode {
    return <Provider store={store}>{children}</Provider>
  }
}
