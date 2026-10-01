import { BalancesAndAllowances } from '@cowprotocol/balances-and-allowances'

import { TabOrderTypes } from 'entities/routes/routes.atom'

import { OrderStatus } from 'legacy/state/orders/actions'

import { ParsedOrder } from 'utils/orderUtils/parseOrder'

import { getOrdersTableList } from './getOrdersTableList'

import { PendingOrdersPermitValidityState } from '../state/permit/pendingOrdersPermitValidity.atom'
import { ordersMock } from '../test/ordersTable.mock'

import type { TwapOrdersList } from 'entities/twap'

jest.mock('./groupOrdersTable', () => ({
  groupOrdersTable: jest.fn(),
}))

jest.mock('./getOrderParams', () => ({
  getOrderParams: jest.fn(),
}))

const { groupOrdersTable } = jest.requireMock('./groupOrdersTable') as {
  groupOrdersTable: jest.Mock
}
const { getOrderParams } = jest.requireMock('./getOrderParams') as {
  getOrderParams: jest.Mock
}

const balancesAndAllowances: BalancesAndAllowances = {
  isLoading: false,
  balances: {},
  allowances: {},
}

const permitState: PendingOrdersPermitValidityState = {}

function makePendingOrder(overrides: Partial<ParsedOrder> = {}): ParsedOrder {
  return {
    ...ordersMock[0],
    status: OrderStatus.PENDING,
    ...overrides,
  }
}

describe('getOrdersTableList', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('keeps persisted unfillable flag when fillability is unknown', () => {
    const order = makePendingOrder({ isUnfillable: true })
    groupOrdersTable.mockReturnValue([order])
    getOrderParams.mockReturnValue({
      hasEnoughBalance: true,
      hasEnoughAllowance: undefined,
    })
    const setIsOrderUnfillable = jest.fn()

    const result = getOrdersTableList(
      [order as never],
      TabOrderTypes.LIMIT,
      1,
      balancesAndAllowances,
      permitState,
      setIsOrderUnfillable,
    )

    expect(setIsOrderUnfillable).not.toHaveBeenCalled()
    expect(result.open).toHaveLength(1)
    expect(result.unfillable).toHaveLength(1)
  })

  it('updates unfillable flag when fillability is known', () => {
    const order = makePendingOrder({ isUnfillable: false })
    groupOrdersTable.mockReturnValue([order])
    getOrderParams.mockReturnValue({
      hasEnoughBalance: true,
      hasEnoughAllowance: false,
    })
    const setIsOrderUnfillable = jest.fn()

    const result = getOrdersTableList(
      [order as never],
      TabOrderTypes.LIMIT,
      1,
      balancesAndAllowances,
      permitState,
      setIsOrderUnfillable,
    )

    expect(setIsOrderUnfillable).toHaveBeenCalledWith({ chainId: 1, id: order.id, isUnfillable: true })
    expect(result.unfillable).toHaveLength(1)
  })

  it('marks an EOA TWAP as unfillable when the next part is not funded', () => {
    const order = makePendingOrder({ composableCowInfo: { id: 'generator' }, isEoaTwapOrder: true })
    const eoaTwapOrders = { [order.id]: { order: { partSellAmount: '500' } } } as unknown as TwapOrdersList
    groupOrdersTable.mockReturnValue([{ parent: order, children: [] }])
    getOrderParams.mockReturnValue({ hasEnoughBalance: false, hasEnoughAllowance: true })
    const setIsOrderUnfillable = jest.fn()

    const result = getOrdersTableList(
      [order as never],
      TabOrderTypes.ADVANCED,
      1,
      balancesAndAllowances,
      permitState,
      setIsOrderUnfillable,
      eoaTwapOrders,
    )

    expect(getOrderParams).toHaveBeenCalledTimes(1)
    expect(getOrderParams).toHaveBeenCalledWith(1, balancesAndAllowances, order, permitState, '500')
    expect(setIsOrderUnfillable).toHaveBeenCalledWith({ chainId: 1, id: order.id, isUnfillable: true })
    expect(result.open).toHaveLength(1)
    expect(result.unfillable).toHaveLength(1)
  })

  it('keeps an EOA TWAP fillable while its indexed part amount is unknown', () => {
    const order = makePendingOrder({ composableCowInfo: { id: 'generator' }, isEoaTwapOrder: true })
    groupOrdersTable.mockReturnValue([order])
    getOrderParams.mockReturnValue({ hasEnoughBalance: undefined, hasEnoughAllowance: undefined })
    const setIsOrderUnfillable = jest.fn()

    const result = getOrdersTableList(
      [order as never],
      TabOrderTypes.ADVANCED,
      1,
      balancesAndAllowances,
      permitState,
      setIsOrderUnfillable,
    )

    expect(getOrderParams).toHaveBeenCalledWith(1, balancesAndAllowances, order, permitState, undefined)
    expect(setIsOrderUnfillable).not.toHaveBeenCalled()
    expect(result.open).toHaveLength(1)
    expect(result.unfillable).toHaveLength(0)
  })

  it('marks a twap parent as unfillable when a child is known-unfillable', () => {
    const parent = makePendingOrder({ id: 'parent', isUnfillable: false })
    const child = makePendingOrder({ id: 'child', status: OrderStatus.SCHEDULED, isUnfillable: false })
    groupOrdersTable.mockReturnValue([{ parent, children: [child] }])
    getOrderParams.mockImplementation((_chainId: number, _baa: BalancesAndAllowances, order: ParsedOrder) => {
      if (order.id === 'parent') {
        return { hasEnoughBalance: true, hasEnoughAllowance: true }
      }

      return { hasEnoughBalance: true, hasEnoughAllowance: false }
    })
    const setIsOrderUnfillable = jest.fn()

    const result = getOrdersTableList(
      [parent as never],
      TabOrderTypes.LIMIT,
      1,
      balancesAndAllowances,
      permitState,
      setIsOrderUnfillable,
    )

    expect(setIsOrderUnfillable).toHaveBeenCalledWith({ chainId: 1, id: 'parent', isUnfillable: true })
    expect(result.unfillable).toHaveLength(1)
  })
})
