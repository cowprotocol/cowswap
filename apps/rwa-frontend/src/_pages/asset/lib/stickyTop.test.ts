import { getStickyTop } from './stickyTop'

describe('getStickyTop', () => {
  it('keeps the gap when the element fits the viewport', () => {
    expect(getStickyTop(900, 700, 16)).toBe(16)
  })

  it('keeps the gap when the element fills the viewport exactly', () => {
    expect(getStickyTop(900, 868, 16)).toBe(16)
  })

  it('aligns a taller element with the viewport bottom', () => {
    expect(getStickyTop(700, 750, 16)).toBe(-66)
  })
})
