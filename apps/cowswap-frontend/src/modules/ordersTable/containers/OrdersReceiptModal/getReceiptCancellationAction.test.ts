import { ParsedOrder } from 'utils/orderUtils/parseOrder'

import { getReceiptCancellationAction } from './getReceiptCancellationAction'

describe('getReceiptCancellationAction', () => {
  it('suppresses unsupported EOA TWAP cancellation', () => {
    const getCancellationAction = jest.fn(() => jest.fn())
    const order = { isEoaTwapOrder: true } as ParsedOrder

    expect(getReceiptCancellationAction(order, getCancellationAction)).toBeNull()
    expect(getCancellationAction).not.toHaveBeenCalled()
  })

  it('returns the existing cancellation action for supported orders', () => {
    const action = jest.fn()
    const getCancellationAction = jest.fn(() => action)
    const order = { isEoaTwapOrder: false } as ParsedOrder

    expect(getReceiptCancellationAction(order, getCancellationAction)).toBe(action)
    expect(getCancellationAction).toHaveBeenCalledWith(order)
  })
})
