import { act, renderHook, waitFor } from '@testing-library/react'
import { useNetworkId } from 'state/network'
import { Network } from 'types'

import { getAccountOrders, Order } from 'api/operator'
import { GetAccountOrdersResponse } from 'api/operator/accountOrderUtils'

import { useGetAccountOrders } from '../../hooks/useGetOrders'

jest.mock('state/network', () => ({
  useNetworkId: jest.fn(),
}))

jest.mock('api/operator', () => ({
  getAccountOrders: jest.fn(),
  getTxOrders: jest.fn(),
}))

jest.mock('api/web3', () => ({
  updateWeb3Provider: jest.fn(),
}))

jest.mock('../../explorer/api', () => ({
  web3: { eth: { getTransaction: jest.fn() } },
}))

jest.mock('services/helpers/tryGetOrderOnAllNetworks', () => ({
  tryGetOrderOnAllNetworksAndEnvironments: jest.fn(),
}))

// The token info layer is covered elsewhere, here it only needs to stay out of the way
jest.mock('hooks/useErc20', () => ({
  useMultipleErc20: () => ({ value: {}, isLoading: false }),
}))

jest.mock('utils', () => ({
  transformOrder: jest.fn((order) => order),
}))

const mockedUseNetworkId = jest.mocked(useNetworkId)
const mockedGetAccountOrders = jest.mocked(getAccountOrders)

const OWNER_A = '0xowner-a'
const OWNER_B = '0xowner-b'

function deferred(): { promise: Promise<GetAccountOrdersResponse>; resolve: (v: GetAccountOrdersResponse) => void } {
  let resolve!: (v: GetAccountOrdersResponse) => void
  const promise = new Promise<GetAccountOrdersResponse>((res) => {
    resolve = res
  })

  return { promise, resolve }
}

function order(uid: string): Order {
  return { uid, buyToken: '0x1', sellToken: '0x2', buyTokenAddress: '0x1', sellTokenAddress: '0x2' } as unknown as Order
}

describe('useGetAccountOrders', () => {
  beforeEach(() => {
    mockedGetAccountOrders.mockReset()
    mockedUseNetworkId.mockReturnValue(Network.MAINNET)
  })

  it('discards a response that a newer request has already superseded', async () => {
    const slowFirstRequest = deferred()

    mockedGetAccountOrders
      .mockReturnValueOnce(slowFirstRequest.promise)
      .mockResolvedValueOnce({ orders: [order('owner-b-order')], hasNextPage: false })

    const { result, rerender } = renderHook(({ owner }) => useGetAccountOrders(owner, 20, 0, 1), {
      initialProps: { owner: OWNER_A },
    })

    rerender({ owner: OWNER_B })

    await waitFor(() => expect(result.current.orders?.map((o) => o.uid)).toEqual(['owner-b-order']))

    // The request for the previous owner only lands now
    await act(async () => {
      slowFirstRequest.resolve({ orders: [order('owner-a-order')], hasNextPage: true })
    })

    expect(result.current.orders?.map((o) => o.uid)).toEqual(['owner-b-order'])
    expect(result.current.isThereNext).toBe(false)
    expect(result.current.isLoading).toBe(false)
  })

  it('keeps the loading state owned by the most recent request', async () => {
    const slowFirstRequest = deferred()
    const slowSecondRequest = deferred()

    mockedGetAccountOrders.mockReturnValueOnce(slowFirstRequest.promise).mockReturnValueOnce(slowSecondRequest.promise)

    const { result, rerender } = renderHook(({ owner }) => useGetAccountOrders(owner, 20, 0, 1), {
      initialProps: { owner: OWNER_A },
    })

    expect(result.current.isLoading).toBe(true)

    rerender({ owner: OWNER_B })

    // The superseded request settles first, but the one that replaced it is still in flight
    await act(async () => {
      slowFirstRequest.resolve({ orders: [order('owner-a-order')], hasNextPage: true })
    })

    expect(result.current.isLoading).toBe(true)

    await act(async () => {
      slowSecondRequest.resolve({ orders: [order('owner-b-order')], hasNextPage: false })
    })

    expect(result.current.isLoading).toBe(false)
    expect(result.current.orders?.map((o) => o.uid)).toEqual(['owner-b-order'])
  })
})
