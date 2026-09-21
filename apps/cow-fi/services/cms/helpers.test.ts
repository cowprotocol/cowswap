import { collectAllPages, toResourceSlugParams } from './helpers'

describe('collectAllPages', () => {
  it('returns a single page when the CMS reports no further pages', async () => {
    const fetchPage = jest.fn(async () => ({
      items: ['one', 'two'],
      page: 1,
      pageCount: 1,
    }))

    await expect(collectAllPages(fetchPage)).resolves.toEqual(['one', 'two'])
    expect(fetchPage).toHaveBeenCalledTimes(1)
    expect(fetchPage).toHaveBeenCalledWith(1)
  })

  it('walks every CMS page until pageCount is reached', async () => {
    const fetchPage = jest.fn(async (page: number) => ({
      items: [`item-${page}`],
      page,
      pageCount: 3,
    }))

    await expect(collectAllPages(fetchPage)).resolves.toEqual(['item-1', 'item-2', 'item-3'])
    expect(fetchPage.mock.calls.map((call) => call[0])).toEqual([1, 2, 3])
  })

  it('stops when a page returns no items even if pageCount claims more', async () => {
    const fetchPage = jest.fn(async (page: number) => ({
      items: page === 1 ? ['kept'] : [],
      page,
      pageCount: 4,
    }))

    await expect(collectAllPages(fetchPage)).resolves.toEqual(['kept'])
    expect(fetchPage).toHaveBeenCalledTimes(2)
  })

  it('returns an empty list when the first page is empty', async () => {
    const fetchPage = jest.fn(async () => ({
      items: [],
      page: 1,
      pageCount: 0,
    }))

    await expect(collectAllPages(fetchPage)).resolves.toEqual([])
    expect(fetchPage).toHaveBeenCalledTimes(1)
  })
})

describe('toResourceSlugParams', () => {
  it('keeps resources that have both a campaign and a slug', () => {
    expect(
      toResourceSlugParams([
        { attributes: { campaign: 'tokens', slug: 'cow-token' } },
        { attributes: { campaign: 'intent-hooks', slug: 'hook-guide' } },
      ]),
    ).toEqual([
      { campaign: 'tokens', slug: 'cow-token' },
      { campaign: 'intent-hooks', slug: 'hook-guide' },
    ])
  })

  it('drops resources with missing attributes, campaign, or slug', () => {
    expect(
      toResourceSlugParams([
        {},
        { attributes: null },
        { attributes: { campaign: 'tokens' } },
        { attributes: { slug: 'cow-token' } },
        { attributes: { campaign: '', slug: 'cow-token' } },
        { attributes: { campaign: 'tokens', slug: '' } },
        { attributes: { campaign: 'tokens', slug: 'kept' } },
      ]),
    ).toEqual([{ campaign: 'tokens', slug: 'kept' }])
  })

  it('preserves constructor as a campaign string instead of the inherited function', () => {
    const params = toResourceSlugParams([{ attributes: { campaign: 'constructor', slug: 'example' } }])

    expect(params).toEqual([{ campaign: 'constructor', slug: 'example' }])
    expect(typeof params[0]?.campaign).toBe('string')
  })
})
