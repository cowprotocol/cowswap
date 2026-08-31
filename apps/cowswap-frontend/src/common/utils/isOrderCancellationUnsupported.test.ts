import { isOrderCancellationUnsupported } from './isOrderCancellationUnsupported'

describe('isOrderCancellationUnsupported', () => {
  it.each([
    { composableCowInfo: { id: '0xparent' }, label: 'parent' },
    { composableCowInfo: { isTheLastPart: true, parentId: '0xparent' }, label: 'last part' },
  ])('returns true for an EOA TWAP $label', ({ composableCowInfo }) => {
    expect(isOrderCancellationUnsupported({ composableCowInfo, isEoaTwapOrder: true })).toBe(true)
  })

  it.each([
    { composableCowInfo: undefined, isEoaTwapOrder: false, label: 'regular order' },
    { composableCowInfo: { id: '0xparent' }, isEoaTwapOrder: false, label: 'Safe TWAP parent' },
    { composableCowInfo: { parentId: '0xparent' }, isEoaTwapOrder: true, label: 'non-final EOA TWAP part' },
  ])('returns false for a supported $label', ({ composableCowInfo, isEoaTwapOrder }) => {
    expect(isOrderCancellationUnsupported({ composableCowInfo, isEoaTwapOrder })).toBe(false)
  })
})
