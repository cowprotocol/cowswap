import { EnrichedOrder } from '@cowprotocol/cow-sdk'

import { orderBookSDK } from 'cowSdk'
import { Network } from 'types'

import { getAccountOrders } from '../../../api/operator/accountOrderUtils'

jest.mock('cowSdk', () => ({
  orderBookSDK: {
    getOrders: jest.fn(),
  },
}))

const mockedOrderBookSDK = jest.mocked(orderBookSDK)

const OLDER_ORDER = { uid: 'older-order', creationDate: '2023-01-01T00:00:00.000Z' }
const OLD_ORDER = { uid: 'old-order', creationDate: '2024-01-01T00:00:00.000Z' }
const NEW_ORDER = { uid: 'new-order', creationDate: '2024-06-01T00:00:00.000Z' }

/**
 * Queues one response per `orderBookSDK.getOrders` call, in order.
 * A page hits the API once for prod and once for barn, but only while that env still has a next page
 */
function queueResponses(...responses: Partial<EnrichedOrder>[][]): void {
  responses.forEach((orders) => {
    mockedOrderBookSDK.getOrders.mockResolvedValueOnce(orders as EnrichedOrder[])
  })
}

// The page cache is module level and keyed by owner, so every test uses its own one
let ownerCount = 0
function nextOwner(): string {
  ownerCount += 1

  return `0xowner${ownerCount}`
}

describe('getAccountOrders cache', () => {
  beforeEach(() => {
    mockedOrderBookSDK.getOrders.mockReset()
  })

  it('serves repeated requests for the same page from the cache', async () => {
    const owner = nextOwner()
    // prod, barn
    queueResponses([OLD_ORDER], [])

    const first = await getAccountOrders({ networkId: Network.MAINNET, owner, offset: 0, limit: 20 })
    const second = await getAccountOrders({ networkId: Network.MAINNET, owner, offset: 0, limit: 20 })

    expect(first.orders.map((order) => order.uid)).toEqual(['old-order'])
    expect(second.orders.map((order) => order.uid)).toEqual(['old-order'])
    // Only the first call reached the API
    expect(mockedOrderBookSDK.getOrders).toHaveBeenCalledTimes(2)
  })

  it('refetches the first page when skipCache is set, so new orders show up', async () => {
    const owner = nextOwner()
    // prod, barn, then prod, barn again for the refresh
    queueResponses([OLD_ORDER], [], [NEW_ORDER, OLD_ORDER], [])

    await getAccountOrders({ networkId: Network.MAINNET, owner, offset: 0, limit: 20 })
    const refreshed = await getAccountOrders({
      networkId: Network.MAINNET,
      owner,
      offset: 0,
      limit: 20,
      skipCache: true,
    })

    expect(refreshed.orders.map((order) => order.uid)).toEqual(['new-order', 'old-order'])
    expect(mockedOrderBookSDK.getOrders).toHaveBeenCalledTimes(4)
  })

  it('ignores skipCache beyond the first page, to not skew the merged pagination', async () => {
    const owner = nextOwner()
    // First page: prod has a next page, barn does not. Second page: prod only
    queueResponses([NEW_ORDER, OLD_ORDER], [], [OLDER_ORDER])

    await getAccountOrders({ networkId: Network.MAINNET, owner, offset: 0, limit: 1 })
    const secondPage = await getAccountOrders({ networkId: Network.MAINNET, owner, offset: 1, limit: 1 })
    const secondPageAgain = await getAccountOrders({
      networkId: Network.MAINNET,
      owner,
      offset: 1,
      limit: 1,
      skipCache: true,
    })

    expect(secondPage.orders.map((order) => order.uid)).toEqual(['old-order'])
    expect(secondPageAgain.orders.map((order) => order.uid)).toEqual(['old-order'])
    expect(mockedOrderBookSDK.getOrders).toHaveBeenCalledTimes(3)
  })
})
