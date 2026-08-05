import { createStore, Provider, type PrimitiveAtom, useAtomValue } from 'jotai'
import { useHydrateAtoms } from 'jotai/utils'
import { ReactNode } from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { AccountType } from '@cowprotocol/types'
import { accountTypeAtom, walletInfoAtom } from '@cowprotocol/wallet'

import { act, render, waitFor } from '@testing-library/react'
import { eoaTwapOrdersAtom } from 'entities/twap'
import { queryClientAtom } from 'jotai-tanstack-query'

import { ordersLimitAtom } from 'modules/orders'

import { featureFlagsAtom } from 'common/state/featureFlagsState'

import { eoaTwapOrdersEffectAtom } from './eoaTwapOrdersEffectAtom'

import { programmaticOrdersApi } from '../services/programmaticOrdersApi'
import { TwapOrderItem, TwapOrderStatus } from '../types'

jest.mock('@cowprotocol/wallet', () => ({
  ...jest.requireActual('@cowprotocol/wallet'),
  accountTypeAtom: jest.requireActual('jotai').atom(jest.requireActual('@cowprotocol/types').AccountType.EOA),
}))
jest.mock('../services/programmaticOrdersApi', () => ({
  programmaticOrdersApi: { fetchEoaTwapOrders: jest.fn() },
}))
jest.mock('entities/twap', () => jest.requireActual('entities/twap/state/eoaTwapOrdersAtom'))

const EOA_A = '0x1111111111111111111111111111111111111111'
const EOA_B = '0x2222222222222222222222222222222222222222'
const CHAIN_ID = SupportedChainId.GNOSIS_CHAIN

const fetchEoaTwapOrdersMock = programmaticOrdersApi.fetchEoaTwapOrders as jest.MockedFunction<
  typeof programmaticOrdersApi.fetchEoaTwapOrders
>
const writableAccountTypeAtom = accountTypeAtom as PrimitiveAtom<AccountType | null>

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
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })

  return function TestWrapper({ children }: { children: ReactNode }): ReactNode {
    useHydrateAtoms([[queryClientAtom, queryClient]], { store })

    return (
      <QueryClientProvider client={queryClient}>
        <Provider store={store}>{children}</Provider>
      </QueryClientProvider>
    )
  }
}

describe('eoaTwapOrdersEffectAtom', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    localStorage.clear()
    fetchEoaTwapOrdersMock.mockResolvedValue({ orders: {}, totalCount: 0 })
  })

  it('loads only explicitly detected EOAs while the feature is enabled', () => {
    const store = createStore()
    store.set(walletInfoAtom, { account: EOA_A, chainId: CHAIN_ID })
    store.set(featureFlagsAtom, { isTwapEoaEnabled: false })
    render(<Effect />, { wrapper: testWrapper(store) })

    expect(fetchEoaTwapOrdersMock).not.toHaveBeenCalled()

    act(() => {
      store.set(writableAccountTypeAtom, AccountType.SMART_CONTRACT)
      store.set(featureFlagsAtom, { isTwapEoaEnabled: true })
    })

    expect(fetchEoaTwapOrdersMock).not.toHaveBeenCalled()
  })

  it('loads TWAP orders for EIP-7702 EOAs', async () => {
    const store = createStore()
    store.set(walletInfoAtom, { account: EOA_A, chainId: CHAIN_ID })
    store.set(featureFlagsAtom, { isTwapEoaEnabled: true })
    store.set(writableAccountTypeAtom, AccountType.EIP7702EOA)

    render(<Effect />, { wrapper: testWrapper(store) })

    await waitFor(() => expect(fetchEoaTwapOrdersMock).toHaveBeenCalledWith(EOA_A, CHAIN_ID, 100))
  })

  it('clears on account changes and ignores stale responses', async () => {
    const store = createStore()
    store.set(walletInfoAtom, { account: EOA_A, chainId: CHAIN_ID })
    store.set(featureFlagsAtom, { isTwapEoaEnabled: true })
    const resolvers = new Map<string, (result: { orders: Record<string, TwapOrderItem>; totalCount: number }) => void>()
    fetchEoaTwapOrdersMock.mockImplementation((owner) => new Promise((resolve) => resolvers.set(owner, resolve)))

    render(<Effect />, { wrapper: testWrapper(store) })
    await waitFor(() => expect(fetchEoaTwapOrdersMock).toHaveBeenCalledWith(EOA_A, CHAIN_ID, 100))

    const orderA = makeOrder('event-a', EOA_A)

    act(() => {
      store.set(walletInfoAtom, { account: EOA_B, chainId: CHAIN_ID })
    })
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
    store.set(featureFlagsAtom, { isTwapEoaEnabled: true })
    fetchEoaTwapOrdersMock.mockRejectedValue(new Error('Unavailable'))

    render(<Effect />, { wrapper: testWrapper(store) })

    await waitFor(() => expect(fetchEoaTwapOrdersMock).toHaveBeenCalled())
    expect(store.get(eoaTwapOrdersAtom)).toEqual({})
  })

  it('preserves cached parents while increasing the requested window', async () => {
    const store = createStore()
    const cachedOrder = makeOrder('cached-event', EOA_A)
    const fetchedOrder = makeOrder('fetched-event', EOA_A)
    store.set(walletInfoAtom, { account: EOA_A, chainId: CHAIN_ID })
    store.set(featureFlagsAtom, { isTwapEoaEnabled: true })
    store.set(eoaTwapOrdersAtom, { [cachedOrder.id]: cachedOrder })
    fetchEoaTwapOrdersMock.mockResolvedValue({ orders: { [fetchedOrder.id]: fetchedOrder }, totalCount: 1 })

    render(<Effect />, { wrapper: testWrapper(store) })

    await waitFor(() => expect(fetchEoaTwapOrdersMock).toHaveBeenCalledWith(EOA_A, CHAIN_ID, 100))
    await waitFor(() =>
      expect(store.get(eoaTwapOrdersAtom)).toEqual({
        [cachedOrder.id]: cachedOrder,
        [fetchedOrder.id]: fetchedOrder,
      }),
    )

    act(() => {
      store.set(ordersLimitAtom, 200)
    })

    await waitFor(() => expect(fetchEoaTwapOrdersMock).toHaveBeenCalledWith(EOA_A, CHAIN_ID, 200))
  })
})

function Effect(): null {
  useAtomValue(eoaTwapOrdersEffectAtom)
  return null
}
