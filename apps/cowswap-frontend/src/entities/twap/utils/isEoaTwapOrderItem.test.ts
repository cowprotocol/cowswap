import { isEoaTwapOrderItem } from './isEoaTwapOrderItem'

describe('isEoaTwapOrderItem', () => {
  const proxy = '0x1111111111111111111111111111111111111111'
  const eoa = '0x2222222222222222222222222222222222222222'

  it('returns true when safeAddress differs from resolvedOwner (EOA TWAP)', () => {
    expect(isEoaTwapOrderItem({ safeAddress: proxy, resolvedOwner: eoa })).toBe(true)
  })

  it('returns false when safeAddress matches resolvedOwner (Safe TWAP)', () => {
    expect(isEoaTwapOrderItem({ safeAddress: proxy, resolvedOwner: proxy })).toBe(false)
  })

  it('treats missing resolvedOwner as Safe TWAP (legacy rows)', () => {
    expect(isEoaTwapOrderItem({ safeAddress: proxy })).toBe(false)
  })
})
