import { collectPages } from './collectPages'

function pages(total: number): jest.Mock<Promise<number[]>, [number, number]> {
  return jest.fn(async (offset: number, limit: number) =>
    Array.from({ length: Math.max(0, Math.min(limit, total - offset)) }, (_, index) => offset + index),
  )
}

const keepEven = (value: number): number | null => (value % 2 === 0 ? value : null)

describe('collectPages', () => {
  it('pages until a short page', async () => {
    const fetchPage = pages(25)

    const result = await collectPages(fetchPage, keepEven, { pageSize: 10, maxPages: 10 })

    expect(fetchPage.mock.calls).toEqual([
      [0, 10],
      [10, 10],
      [20, 10],
    ])
    expect(result).toEqual([0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24])
  })

  it('stops at the limit of selected items', async () => {
    const fetchPage = pages(100)

    const result = await collectPages(fetchPage, keepEven, { pageSize: 10, maxPages: 10, limit: 7 })

    expect(result).toEqual([0, 2, 4, 6, 8, 10, 12])
    expect(fetchPage).toHaveBeenCalledTimes(2)
  })

  it('stops at the page cap', async () => {
    const fetchPage = pages(1000)

    await collectPages(fetchPage, keepEven, { pageSize: 10, maxPages: 3 })

    expect(fetchPage).toHaveBeenCalledTimes(3)
  })
})
