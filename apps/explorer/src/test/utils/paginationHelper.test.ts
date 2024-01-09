import { getPageIndex } from 'apps/explorer/components/OrdersTableWidget/useTable'

describe('Calculate pageIndex from offsets through pageSize', () => {
  test('should return 1 when offset is smaller than the page size', () => {
    expect(getPageIndex(0, 10)).toEqual(1)
  })

  test('should return 2 when offsets is equals than the page size', () => {
    expect(getPageIndex(20, 20)).toEqual(2)
  })

  test('should return 3 when offsets is between one half and one quarter of 100/20', () => {
    expect(getPageIndex(59, 20)).toEqual(3)
  })

  test('should return 4 when offsets is one quarter of 100/20', () => {
    expect(getPageIndex(60, 20)).toEqual(4)
  })
})
