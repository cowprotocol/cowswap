import { OrderClass } from '@cowprotocol/cow-sdk'

import { Order, OrderStatus } from 'legacy/state/orders/actions'
import { PartialOrdersMap } from 'legacy/state/orders/reducer'
import { deserializeOrder } from 'legacy/state/orders/utils/deserializeOrder'

import { getIsBridgeOrder } from 'common/utils/getIsBridgeOrder'

import { _getOrdersToQueueForSurplusModal } from './OrdersFromApiUpdater'

jest.mock('legacy/state/orders/utils/deserializeOrder', () => ({
  deserializeOrder: jest.fn(),
}))

jest.mock('common/utils/getIsBridgeOrder', () => ({
  getIsBridgeOrder: jest.fn(() => false),
}))

const mockDeserializeOrder = deserializeOrder as jest.MockedFunction<typeof deserializeOrder>
const mockGetIsBridgeOrder = getIsBridgeOrder as jest.MockedFunction<typeof getIsBridgeOrder>

function buildOrder(overrides: Partial<Order> = {}): Order {
  return {
    id: '0xorder',
    class: OrderClass.MARKET,
    status: OrderStatus.FULFILLED,
    fullAppData: undefined,
    ...overrides,
  } as Order
}

/** Stubs `deserializeOrder` to report a given previous status per order id, keyed by `allOrdersMap`. */
function mockOrdersMap(previousStatusById: Record<string, OrderStatus | undefined>): PartialOrdersMap {
  mockDeserializeOrder.mockImplementation((orderObject) => {
    const id = (orderObject as unknown as { __id?: string } | undefined)?.__id
    const status = id ? previousStatusById[id] : undefined
    return status === undefined ? undefined : ({ status } as Order)
  })

  return Object.fromEntries(
    Object.keys(previousStatusById).map((id) => [id, { __id: id }]),
  ) as unknown as PartialOrdersMap
}

describe('_getOrdersToQueueForSurplusModal', () => {
  beforeEach(() => {
    mockGetIsBridgeOrder.mockReturnValue(false)
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  it('queues a swap order that just transitioned from pending to fulfilled', () => {
    const order = buildOrder({ id: 'A' })
    const allOrdersMap = mockOrdersMap({ A: OrderStatus.PENDING })

    expect(_getOrdersToQueueForSurplusModal([order], allOrdersMap)).toEqual([order])
  })

  it('ignores an order that is not fulfilled yet', () => {
    const order = buildOrder({ id: 'B', status: OrderStatus.PENDING })
    const allOrdersMap = mockOrdersMap({ B: OrderStatus.PENDING })

    expect(_getOrdersToQueueForSurplusModal([order], allOrdersMap)).toEqual([])
  })

  it('ignores an order already known locally as fulfilled (no new transition, avoids re-queueing)', () => {
    const order = buildOrder({ id: 'C' })
    const allOrdersMap = mockOrdersMap({ C: OrderStatus.FULFILLED })

    expect(_getOrdersToQueueForSurplusModal([order], allOrdersMap)).toEqual([])
  })

  it('ignores an order never seen locally before, e.g. a past order returned on first load', () => {
    const order = buildOrder({ id: 'D' })
    const allOrdersMap = mockOrdersMap({})

    expect(_getOrdersToQueueForSurplusModal([order], allOrdersMap)).toEqual([])
  })

  it('ignores a non-swap (limit) order', () => {
    const order = buildOrder({ id: 'E', class: OrderClass.LIMIT })
    const allOrdersMap = mockOrdersMap({ E: OrderStatus.PENDING })

    expect(_getOrdersToQueueForSurplusModal([order], allOrdersMap)).toEqual([])
  })

  it('ignores a bridge (cross-chain) order', () => {
    mockGetIsBridgeOrder.mockReturnValue(true)
    const order = buildOrder({ id: 'F' })
    const allOrdersMap = mockOrdersMap({ F: OrderStatus.PENDING })

    expect(_getOrdersToQueueForSurplusModal([order], allOrdersMap)).toEqual([])
  })

  it('handles a mixed batch, queueing only the eligible transition', () => {
    const justFulfilled = buildOrder({ id: 'G' })
    const stillPending = buildOrder({ id: 'H', status: OrderStatus.PENDING })
    const alreadyFulfilled = buildOrder({ id: 'I' })
    const allOrdersMap = mockOrdersMap({
      G: OrderStatus.PENDING,
      H: OrderStatus.PENDING,
      I: OrderStatus.FULFILLED,
    })

    expect(_getOrdersToQueueForSurplusModal([justFulfilled, stillPending, alreadyFulfilled], allOrdersMap)).toEqual([
      justFulfilled,
    ])
  })
})
