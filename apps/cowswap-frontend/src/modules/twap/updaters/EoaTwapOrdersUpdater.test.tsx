import { createStore, Provider } from 'jotai'
import { ReactNode } from 'react'

import { useFeatureFlags } from '@cowprotocol/common-hooks'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { AccountType } from '@cowprotocol/types'
import { useAccountType, useWalletInfo, walletInfoAtom } from '@cowprotocol/wallet'

import { act, render, waitFor } from '@testing-library/react'
import { eoaTwapOrdersAtom } from 'entities/twap'
import { SWRConfig } from 'swr'

import { EoaTwapOrdersUpdater } from './EoaTwapOrdersUpdater'

import { fetchEoaTwapOrders } from '../services/fetchEoaTwapOrders'
import { eoaTwapOrdersRequestAtom } from '../state/eoaTwapOrdersRequestAtom'
import { TwapOrderItem, TwapOrderStatus } from '../types'

jest.mock('@cowprotocol/common-hooks', () => ({
  ...jest.requireActual('@cowprotocol/common-hooks'),
  useFeatureFlags: jest.fn(),
}))
jest.mock('@cowprotocol/wallet', () => ({
  ...jest.requireActual('@cowprotocol/wallet'),
  useAccountType: jest.fn(),
  useWalletInfo: jest.fn(),
}))
jest.mock('../services/fetchEoaTwapOrders', () => ({ fetchEoaTwapOrders: jest.fn() }))
jest.mock('entities/twap', () => jest.requireActual('entities/twap/state/eoaTwapOrdersAtom'))

const EOA_A = '0x1111111111111111111111111111111111111111'
const EOA_B = '0x2222222222222222222222222222222222222222'
const CHAIN_ID = SupportedChainId.GNOSIS_CHAIN

const useFeatureFlagsMock = useFeatureFlags as jest.MockedFunction<typeof useFeatureFlags>
const useAccountTypeMock = useAccountType as jest.MockedFunction<typeof useAccountType>
const useWalletInfoMock = useWalletInfo as jest.MockedFunction<typeof useWalletInfo>
const fetchEoaTwapOrdersMock = fetchEoaTwapOrders as jest.MockedFunction<typeof fetchEoaTwapOrders>

function makeOrder(id: string, resolvedOwner: string): TwapOrderItem {
  return {
    id,
    hash: `hash-${id}`,
    chainId: CHAIN_ID,
    safeAddress: '0x3333333333333333333333333333333333333333',
    resolvedOwner,
    status: TwapOrderStatus.Pending,
    submissionDate: new Date(0).toISOString(),
    order: {
      sellToken: '0x4444444444444444444444444444444444444444',
      buyToken: '0x5555555555555555555555555555555555555555',
      receiver: resolvedOwner,
      partSellAmount: '1',
      minPartLimit: '1',
      t0: 0,
      n: 1,
      t: 60,
      span: 0,
      appData: `0x${'00'.repeat(32)}`,
    },
    executionInfo: {
      confirmedPartsCount: 0,
      info: { executedSellAmount: '0', executedBuyAmount: '0', executedFeeAmount: '0' },
    },
    partOrdersCount: 0,
  }
}

function testWrapper(store: ReturnType<typeof createStore>): ({ children }: { children: ReactNode }) => ReactNode {
  return function TestWrapper({ children }: { children: ReactNode }): ReactNode {
    return (
      <Provider store={store}>
        <SWRConfig value={{ provider: () => new Map(), dedupingInterval: 0 }}>{children}</SWRConfig>
      </Provider>
    )
  }
}

describe('EoaTwapOrdersUpdater', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    localStorage.clear()
    useFeatureFlagsMock.mockReturnValue({ isTwapEoaEnabled: true })
    useAccountTypeMock.mockReturnValue(AccountType.EOA)
    useWalletInfoMock.mockReturnValue({ account: EOA_A, chainId: CHAIN_ID })
    fetchEoaTwapOrdersMock.mockResolvedValue({ orders: {}, totalCount: 0 })
  })

  it('loads only explicitly detected EOAs while the feature is enabled', () => {
    useFeatureFlagsMock.mockReturnValue({ isTwapEoaEnabled: false })
    const { rerender } = render(<EoaTwapOrdersUpdater />)

    expect(fetchEoaTwapOrdersMock).not.toHaveBeenCalled()

    useFeatureFlagsMock.mockReturnValue({ isTwapEoaEnabled: true })
    useAccountTypeMock.mockReturnValue(AccountType.SMART_CONTRACT)
    rerender(<EoaTwapOrdersUpdater />)

    expect(fetchEoaTwapOrdersMock).not.toHaveBeenCalled()
  })

  it('clears on account changes and ignores stale responses', async () => {
    const store = createStore()
    store.set(walletInfoAtom, { account: EOA_A, chainId: CHAIN_ID })
    const resolvers = new Map<string, (result: { orders: Record<string, TwapOrderItem>; totalCount: number }) => void>()
    fetchEoaTwapOrdersMock.mockImplementation((owner) => new Promise((resolve) => resolvers.set(owner, resolve)))

    const { rerender } = render(<EoaTwapOrdersUpdater />, { wrapper: testWrapper(store) })
    await waitFor(() => expect(fetchEoaTwapOrdersMock).toHaveBeenCalledWith(EOA_A, CHAIN_ID, 100))

    const orderA = makeOrder('event-a', EOA_A)

    useWalletInfoMock.mockReturnValue({ account: EOA_B, chainId: CHAIN_ID })
    store.set(walletInfoAtom, { account: EOA_B, chainId: CHAIN_ID })
    rerender(<EoaTwapOrdersUpdater />)
    await waitFor(() => expect(fetchEoaTwapOrdersMock).toHaveBeenCalledWith(EOA_B, CHAIN_ID, 100))
    await waitFor(() => expect(store.get(eoaTwapOrdersAtom)).toEqual({}))

    act(() => resolvers.get(EOA_A)?.({ orders: { [orderA.id]: orderA }, totalCount: 1 }))
    await waitFor(() => expect(store.get(eoaTwapOrdersAtom)).toEqual({}))

    const orderB = makeOrder('event-b', EOA_B)
    act(() => resolvers.get(EOA_B)?.({ orders: { [orderB.id]: orderB }, totalCount: 1 }))
    await waitFor(() => expect(store.get(eoaTwapOrdersAtom)).toEqual({ [orderB.id]: orderB }))
  })

  it('keeps the current state empty when loading fails', async () => {
    const store = createStore()
    store.set(walletInfoAtom, { account: EOA_A, chainId: CHAIN_ID })
    fetchEoaTwapOrdersMock.mockRejectedValue(new Error('Unavailable'))

    render(<EoaTwapOrdersUpdater />, { wrapper: testWrapper(store) })

    await waitFor(() => expect(fetchEoaTwapOrdersMock).toHaveBeenCalled())
    expect(store.get(eoaTwapOrdersAtom)).toEqual({})
  })

  it('preserves cached parents while increasing the requested window', async () => {
    const store = createStore()
    const cachedOrder = makeOrder('cached-event', EOA_A)
    const fetchedOrder = makeOrder('fetched-event', EOA_A)
    store.set(walletInfoAtom, { account: EOA_A, chainId: CHAIN_ID })
    store.set(eoaTwapOrdersAtom, { [cachedOrder.id]: cachedOrder })
    fetchEoaTwapOrdersMock.mockResolvedValue({ orders: { [fetchedOrder.id]: fetchedOrder }, totalCount: 1 })

    render(<EoaTwapOrdersUpdater />, { wrapper: testWrapper(store) })

    await waitFor(() => expect(fetchEoaTwapOrdersMock).toHaveBeenCalledWith(EOA_A, CHAIN_ID, 100))
    await waitFor(() =>
      expect(store.get(eoaTwapOrdersAtom)).toEqual({
        [cachedOrder.id]: cachedOrder,
        [fetchedOrder.id]: fetchedOrder,
      }),
    )

    act(() => {
      store.set(eoaTwapOrdersRequestAtom, {
        requestKey: `${CHAIN_ID}:${EOA_A}`,
        limit: 200,
        isLoading: true,
        totalCount: 1000,
      })
    })

    await waitFor(() => expect(fetchEoaTwapOrdersMock).toHaveBeenCalledWith(EOA_A, CHAIN_ID, 200))
  })
})
