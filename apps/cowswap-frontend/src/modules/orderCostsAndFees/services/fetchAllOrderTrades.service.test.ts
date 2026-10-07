import { Trade } from '@cowprotocol/cow-sdk'

import { getTrades } from 'api/cowProtocol/api'

import { ALL_TRADES_PAGE_SIZE, fetchAllOrderTrades } from './fetchAllOrderTrades.service'

jest.mock('api/cowProtocol/api', () => ({ getTrades: jest.fn() }))

const mockedGetTrades = jest.mocked(getTrades)

function fill(index: number): Trade {
  return { blockNumber: 42, logIndex: index, txHash: null } as Trade
}

function fullPage(): Trade[] {
  return Array.from({ length: ALL_TRADES_PAGE_SIZE }, (_, index) => fill(index))
}

beforeEach(() => mockedGetTrades.mockReset())

describe('fetchAllOrderTrades', () => {
  it('stops after a short page', async () => {
    mockedGetTrades.mockResolvedValue([fill(0), fill(1)])

    await expect(fetchAllOrderTrades(1, '0xorder')).resolves.toHaveLength(2)
    expect(mockedGetTrades).toHaveBeenCalledTimes(1)
    expect(mockedGetTrades).toHaveBeenCalledWith(
      { orderUid: '0xorder', offset: 0, limit: ALL_TRADES_PAGE_SIZE },
      { chainId: 1 },
    )
  })

  it('keeps paging while the API fills every page', async () => {
    const fills = [...fullPage(), fill(ALL_TRADES_PAGE_SIZE)]
    mockedGetTrades.mockImplementation(async ({ offset = 0 }) => fills.slice(offset, offset + ALL_TRADES_PAGE_SIZE))

    await expect(fetchAllOrderTrades(1, '0xorder')).resolves.toHaveLength(fills.length)
    expect(mockedGetTrades).toHaveBeenLastCalledWith(expect.objectContaining({ offset: ALL_TRADES_PAGE_SIZE }), {
      chainId: 1,
    })
  })

  it('stops instead of duplicating fills when the API ignores the offset', async () => {
    mockedGetTrades.mockResolvedValue(fullPage())

    await expect(fetchAllOrderTrades(1, '0xorder')).resolves.toHaveLength(ALL_TRADES_PAGE_SIZE)
    expect(mockedGetTrades).toHaveBeenCalledTimes(2)
  })

  it('leaves env out of the context when none is given', async () => {
    mockedGetTrades.mockResolvedValue([])

    await fetchAllOrderTrades(1, '0xorder')

    const context = mockedGetTrades.mock.calls[0][1]
    expect(context && 'env' in context).toBe(false)
  })

  it('queries the given environment', async () => {
    mockedGetTrades.mockResolvedValue([])

    await fetchAllOrderTrades(100, '0xorder', 'prod')

    expect(mockedGetTrades).toHaveBeenCalledWith(expect.anything(), { chainId: 100, env: 'prod' })
  })

  it('keeps fills with null txHash but different blockNumbers', async () => {
    const fills = [
      { blockNumber: 100, logIndex: 0, txHash: null } as Trade,
      { blockNumber: 200, logIndex: 0, txHash: null } as Trade,
    ]
    mockedGetTrades.mockResolvedValue(fills)

    await expect(fetchAllOrderTrades(1, '0xorder')).resolves.toHaveLength(2)
    expect(mockedGetTrades).toHaveBeenCalledTimes(1)
  })
})
