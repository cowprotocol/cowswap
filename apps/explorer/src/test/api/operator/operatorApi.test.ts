import { orderBookSDK } from 'cowSdk'

import {
  getOrder,
  getOrderCompetitionStatus,
  getSolverCompetitionByTxHash,
  getTrades,
  getTxOrders,
} from '../../../api/operator/operatorApi'
import { OrderCompetitionStatus, RawOrder, RawTrade, SolverCompetitionResponse } from '../../../api/operator/types'

jest.mock('cowSdk', () => ({
  orderBookSDK: {
    getOrder: jest.fn(),
    getTrades: jest.fn(),
    getOrderCompetitionStatus: jest.fn(),
    getSolverCompetition: jest.fn(),
    getTxOrders: jest.fn(),
  },
}))

const mockedOrderBookSDK = jest.mocked(orderBookSDK)
const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {})

function unresolvedPromise<T>(): Promise<T> {
  return new Promise(() => undefined)
}

const PROD_ORDER = { uid: 'prod-order' } as RawOrder
const TRADE_A = { txHash: '0xa', blockNumber: 1 } as RawTrade
const TRADE_B = { txHash: '0xb', blockNumber: 2 } as RawTrade

describe('operatorApi competition fallbacks', () => {
  beforeEach(() => {
    jest.useRealTimers()
    mockedOrderBookSDK.getOrder.mockReset()
    mockedOrderBookSDK.getTrades.mockReset()
    mockedOrderBookSDK.getOrderCompetitionStatus.mockReset()
    mockedOrderBookSDK.getSolverCompetition.mockReset()
    mockedOrderBookSDK.getTxOrders.mockReset()
    consoleErrorSpy.mockClear()
  })

  afterAll(() => {
    consoleErrorSpy.mockRestore()
  })

  it('falls back to prod order when staging fails', async () => {
    mockedOrderBookSDK.getOrder.mockResolvedValueOnce(PROD_ORDER).mockRejectedValueOnce(new Error('staging down'))

    const result = await getOrder({ networkId: 1, orderId: 'order-1' })

    expect(result).toEqual(PROD_ORDER)
  })

  it('rejects getOrder when one env fails and the other times out', async () => {
    jest.useFakeTimers()
    mockedOrderBookSDK.getOrder
      .mockRejectedValueOnce(new Error('prod down'))
      .mockImplementationOnce(() => unresolvedPromise())

    const promise = getOrder({ networkId: 1, orderId: 'order-timeout' })
    const rejectionExpectation = expect(promise).rejects.toThrow('All promises were rejected')

    await jest.advanceTimersByTimeAsync(12_001)

    await rejectionExpectation
  })

  it('returns merged trades when both environments succeed', async () => {
    mockedOrderBookSDK.getTrades.mockResolvedValueOnce([TRADE_A]).mockResolvedValueOnce([TRADE_B])

    const result = await getTrades({ networkId: 1, orderId: 'order-1', offset: 0, limit: 11 })

    expect(result).toEqual([TRADE_A, TRADE_B])
  })

  it('returns prod trades when staging fails', async () => {
    mockedOrderBookSDK.getTrades.mockResolvedValueOnce([TRADE_A]).mockRejectedValueOnce(new Error('staging 504'))

    const result = await getTrades({ networkId: 1, orderId: 'order-2', offset: 0, limit: 11 })

    expect(result).toEqual([TRADE_A])
  })

  it('returns staging trades when prod is empty', async () => {
    mockedOrderBookSDK.getTrades.mockResolvedValueOnce([]).mockResolvedValueOnce([TRADE_B])

    const result = await getTrades({ networkId: 1, orderId: 'order-3', offset: 0, limit: 11 })

    expect(result).toEqual([TRADE_B])
  })

  it('throws when both trades requests fail', async () => {
    mockedOrderBookSDK.getTrades
      .mockRejectedValueOnce(new Error('prod down'))
      .mockRejectedValueOnce(new Error('staging down'))

    await expect(getTrades({ networkId: 1, orderId: 'order-4', offset: 0, limit: 11 })).rejects.toBeInstanceOf(
      AggregateError,
    )
  })

  it('falls back to staging order competition status when prod returns undefined', async () => {
    const stagingStatus = {
      type: 'traded',
      value: [{ solver: 'stagingSolver', executedAmounts: { sell: '1', buy: '1' } }],
    } as OrderCompetitionStatus

    mockedOrderBookSDK.getOrderCompetitionStatus
      .mockResolvedValueOnce(undefined as unknown as OrderCompetitionStatus)
      .mockResolvedValueOnce(stagingStatus)

    const result = await getOrderCompetitionStatus({ networkId: 1, orderId: 'order-1' })

    expect(result).toEqual(stagingStatus)
    expect(mockedOrderBookSDK.getOrderCompetitionStatus).toHaveBeenCalledTimes(2)
  })

  it('returns undefined order competition status when both environments are empty', async () => {
    mockedOrderBookSDK.getOrderCompetitionStatus
      .mockResolvedValueOnce(undefined as unknown as OrderCompetitionStatus)
      .mockResolvedValueOnce(undefined as unknown as OrderCompetitionStatus)

    const result = await getOrderCompetitionStatus({ networkId: 1, orderId: 'order-2' })

    expect(result).toBeUndefined()
  })

  it('falls back to staging solver competition when prod has empty solutions', async () => {
    const stagingCompetition = {
      auctionId: 2,
      solutions: [{ isWinner: true, ranking: 1, orders: [] }],
    } as unknown as SolverCompetitionResponse

    mockedOrderBookSDK.getSolverCompetition
      .mockResolvedValueOnce({ auctionId: 1, solutions: [] } as SolverCompetitionResponse)
      .mockResolvedValueOnce(stagingCompetition)

    const result = await getSolverCompetitionByTxHash({ networkId: 1, txHash: '0xtxhash' })

    expect(result).toEqual(stagingCompetition)
    expect(mockedOrderBookSDK.getSolverCompetition).toHaveBeenCalledTimes(2)
  })

  it('returns undefined solver competition when both environments are empty', async () => {
    mockedOrderBookSDK.getSolverCompetition
      .mockResolvedValueOnce({ auctionId: 1, solutions: [] } as SolverCompetitionResponse)
      .mockResolvedValueOnce({ auctionId: 1, solutions: [] } as SolverCompetitionResponse)

    const result = await getSolverCompetitionByTxHash({ networkId: 1, txHash: '0xnone' })

    expect(result).toBeUndefined()
  })

  it('returns undefined order competition when one env is empty and the other times out', async () => {
    jest.useFakeTimers()
    mockedOrderBookSDK.getOrderCompetitionStatus
      .mockResolvedValueOnce(undefined as unknown as OrderCompetitionStatus)
      .mockImplementationOnce(() => unresolvedPromise())

    const resultPromise = getOrderCompetitionStatus({ networkId: 1, orderId: 'order-timeout' })

    await jest.advanceTimersByTimeAsync(12_001)

    await expect(resultPromise).resolves.toBeUndefined()
  })

  it('returns undefined solver competition when one env is empty and the other times out', async () => {
    jest.useFakeTimers()
    mockedOrderBookSDK.getSolverCompetition
      .mockResolvedValueOnce({ auctionId: 1, solutions: [] } as SolverCompetitionResponse)
      .mockImplementationOnce(() => unresolvedPromise())

    const resultPromise = getSolverCompetitionByTxHash({ networkId: 1, txHash: '0xtimeout' })

    await jest.advanceTimersByTimeAsync(12_001)

    await expect(resultPromise).resolves.toBeUndefined()
  })

  it('returns empty tx orders when prod is empty and staging times out', async () => {
    jest.useFakeTimers()
    mockedOrderBookSDK.getTxOrders.mockResolvedValueOnce([]).mockImplementationOnce(() => unresolvedPromise())

    const resultPromise = getTxOrders({ networkId: 1, txHash: '0xtx-empty' })

    await jest.advanceTimersByTimeAsync(12_001)

    await expect(resultPromise).resolves.toEqual([])
  })
})
