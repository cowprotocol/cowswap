import { EnrichedOrder, SupportedChainId } from '@cowprotocol/cow-sdk'

import { getOrders } from 'api/cowProtocol'

import { fetchMissingPartOrders } from './fetchMissingPartOrders'

jest.mock('api/cowProtocol', () => ({
  getOrders: jest.fn(),
}))

const getOrdersMock = getOrders as jest.MockedFunction<typeof getOrders>

const ACCOUNT = '0x1111111111111111111111111111111111111111'

function createTestOrder(uid: string): EnrichedOrder {
  return { uid } as EnrichedOrder
}

describe('fetchMissingPartOrders', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('returns empty result and skips API calls when all orders are already present', async () => {
    // arrange
    const existingOrdersByUid = {
      order_part_1: createTestOrder('order_part_1'),
    }
    const partOrderIds = ['order_part_1']

    // act
    const result = await fetchMissingPartOrders(
      SupportedChainId.MAINNET,
      ACCOUNT,
      partOrderIds,
      existingOrdersByUid,
      //
    )

    // assert
    expect(result).toEqual([])
    expect(getOrdersMock).not.toHaveBeenCalled()
  })

  it('fetches missing orders across pages until all are found', async () => {
    // arrange
    const partOrderIds = ['order_part_1', 'order_part_2']
    const existingOrdersByUid: Record<string, EnrichedOrder> = {}
    const firstPage = [
      createTestOrder('order_part_1'),
      ...Array.from({ length: 998 }, (_, i) => createTestOrder(`noise-${i}`)),
      createTestOrder('has-next-page-marker'),
    ]
    const secondPage = [createTestOrder('order_part_2')]

    getOrdersMock.mockResolvedValueOnce(firstPage).mockResolvedValueOnce(secondPage)

    // act
    const result = await fetchMissingPartOrders(
      SupportedChainId.MAINNET,
      ACCOUNT,
      partOrderIds,
      existingOrdersByUid,
      //
    )

    // assert
    expect(result).toEqual(expect.arrayContaining([createTestOrder('order_part_1'), createTestOrder('order_part_2')]))
    expect(result).toHaveLength(2)

    expect(getOrdersMock).toHaveBeenNthCalledWith(
      1,
      { owner: ACCOUNT, offset: 0, limit: 1000 },
      { chainId: SupportedChainId.MAINNET, env: 'prod' },
    )
    expect(getOrdersMock).toHaveBeenNthCalledWith(
      2,
      { owner: ACCOUNT, offset: 999, limit: 1000 },
      { chainId: SupportedChainId.MAINNET, env: 'prod' },
    )
  })

  it('stops after first page when there is no next page', async () => {
    // arrange
    const partOrderIds = ['order_part_1', 'order_part_2']
    const existingOrdersByUid: Record<string, EnrichedOrder> = {}
    getOrdersMock.mockResolvedValueOnce([createTestOrder('order_part_1')])

    // act
    const result = await fetchMissingPartOrders(
      SupportedChainId.MAINNET,
      ACCOUNT,
      partOrderIds,
      existingOrdersByUid,
      //
    )

    // assert
    expect(result).toEqual([createTestOrder('order_part_1')])
    expect(getOrdersMock).toHaveBeenCalledTimes(1)
  })

  it('stops when aborted and does not continue pagination', async () => {
    // arrange
    const partOrderIds = ['order_part_1', 'order_part_2']
    const existingOrdersByUid: Record<string, EnrichedOrder> = {}
    const controller = new AbortController()

    getOrdersMock.mockImplementationOnce(async () => {
      controller.abort()

      return [
        createTestOrder('order_part_1'),
        ...Array.from({ length: 998 }, (_, i) => createTestOrder(`noise-${i}`)),
        createTestOrder('has-next-page-marker'),
      ]
    })

    // act
    const result = await fetchMissingPartOrders(
      SupportedChainId.MAINNET,
      ACCOUNT,
      partOrderIds,
      existingOrdersByUid,
      controller.signal,
    )

    // assert
    expect(result).toEqual([])
    expect(getOrdersMock).toHaveBeenCalledTimes(1)
  })
})
