import { getPageItems } from './pageItems'

describe('getPageItems', () => {
  it('lists every page when they fit', () => {
    expect(getPageItems(3, 11, 11)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11])
  })

  it.each([
    [1, [1, 2, 3, 4, 5, 6, 7, 8, 9, 'end-gap', 93]],
    [6, [1, 2, 3, 4, 5, 6, 7, 8, 9, 'end-gap', 93]],
    [7, [1, 'start-gap', 4, 5, 6, 7, 8, 9, 10, 'end-gap', 93]],
    [46, [1, 'start-gap', 43, 44, 45, 46, 47, 48, 49, 'end-gap', 93]],
    [87, [1, 'start-gap', 84, 85, 86, 87, 88, 89, 90, 'end-gap', 93]],
    [88, [1, 'start-gap', 85, 86, 87, 88, 89, 90, 91, 92, 93]],
    [93, [1, 'start-gap', 85, 86, 87, 88, 89, 90, 91, 92, 93]],
  ])('fills 11 slots on page %i of 93', (page, expected) => {
    expect(getPageItems(page, 93, 11)).toEqual(expected)
  })

  it.each([
    [1, [1, 2, 3, 4, 5, 'end-gap', 93]],
    [4, [1, 2, 3, 4, 5, 'end-gap', 93]],
    [5, [1, 'start-gap', 4, 5, 6, 'end-gap', 93]],
    [46, [1, 'start-gap', 45, 46, 47, 'end-gap', 93]],
    [93, [1, 'start-gap', 89, 90, 91, 92, 93]],
  ])('fills 7 slots on page %i of 93', (page, expected) => {
    expect(getPageItems(page, 93, 7)).toEqual(expected)
  })
})
