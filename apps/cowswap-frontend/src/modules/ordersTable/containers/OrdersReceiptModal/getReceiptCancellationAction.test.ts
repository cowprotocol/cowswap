import { ParsedOrder } from 'utils/orderUtils/parseOrder'

import { getReceiptCancellationAction } from './getReceiptCancellationAction'

describe('getReceiptCancellationAction', () => {
  it.each([
    { composableCowInfo: { id: '0xparent' }, label: 'parent' },
    { composableCowInfo: { isTheLastPart: true, parentId: '0xparent' }, label: 'last part' },
  ])('suppresses unsupported EOA TWAP $label cancellation', ({ composableCowInfo }) => {
    const getCancellationAction = jest.fn(() => jest.fn())
    const order = { composableCowInfo, isEoaTwapOrder: true } as ParsedOrder

    expect(getReceiptCancellationAction(order, getCancellationAction)).toBeNull()
    expect(getCancellationAction).not.toHaveBeenCalled()
  })

  it.each([
    { composableCowInfo: undefined, isEoaTwapOrder: false, label: 'regular order' },
    { composableCowInfo: { parentId: '0xparent' }, isEoaTwapOrder: true, label: 'non-final EOA TWAP part' },
  ])('returns the existing cancellation action for a supported $label', ({ composableCowInfo, isEoaTwapOrder }) => {
    const action = jest.fn()
    const getCancellationAction = jest.fn(() => action)
    const order = { composableCowInfo, isEoaTwapOrder } as ParsedOrder

    expect(getReceiptCancellationAction(order, getCancellationAction)).toBe(action)
    expect(getCancellationAction).toHaveBeenCalledWith(order)
  })
})
