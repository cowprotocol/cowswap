const mockGet = jest.fn()

jest.mock('@cowprotocol/core', () => ({
  getCmsClient: () => ({ GET: (...args: unknown[]) => mockGet(...args) }),
}))

import { getAllArticleSlugs, getArticleBySlug, getArticles } from './index'

describe('getAllArticleSlugs', () => {
  beforeEach(() => {
    mockGet.mockReset()
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('reads every CMS page and deduplicates valid slugs', async () => {
    const firstPageSlugs = ['first-article', 'duplicate-article', ...articleSlugs('first-page', 98)]
    const secondPageSlugs = ['duplicate-article', 'invalid slug', ...articleSlugs('second-page', 98)]

    mockGet
      .mockResolvedValueOnce(cmsResult(1, 3, firstPageSlugs, { total: 201 }))
      .mockResolvedValueOnce(cmsResult(2, 3, secondPageSlugs, { total: 201 }))
      .mockResolvedValueOnce(cmsResult(3, 3, ['final-article'], { total: 201 }))

    const slugs = await getAllArticleSlugs()

    expect(slugs).toHaveLength(199)
    expect(slugs).toEqual(expect.arrayContaining(['first-article', 'duplicate-article', 'final-article']))
    expect(slugs).not.toContain('invalid slug')
    expect(mockGet).toHaveBeenCalledTimes(3)
    expect(mockGet.mock.calls.map(([, options]) => options.params.query['pagination[page]'])).toEqual([1, 2, 3])
  })

  it('fails static slug enumeration instead of returning a partial route set', async () => {
    const failure = new Error('CMS unavailable')
    jest.spyOn(console, 'error').mockImplementation()

    mockGet
      .mockResolvedValueOnce(cmsResult(1, 2, articleSlugs('first-page', 100), { total: 200 }))
      .mockResolvedValueOnce({ error: failure, response: { status: 503, url: 'https://cms.example/articles?page=2' } })

    await expect(getAllArticleSlugs()).rejects.toBe(failure)
  })

  it('aborts a stalled slug enumeration request after the scoped timeout', async () => {
    jest.useFakeTimers()
    let receivedSignal: AbortSignal | undefined

    try {
      mockGet.mockImplementation((_endpoint: unknown, options: unknown) => {
        receivedSignal = (options as { signal?: AbortSignal }).signal
        return new Promise(() => undefined)
      })

      const rejection = expect(getAllArticleSlugs()).rejects.toThrow(
        'Timed out fetching CMS article slugs page 1 after 15000ms',
      )

      await jest.advanceTimersByTimeAsync(15_000)
      await rejection

      expect(receivedSignal).toBeDefined()
      expect(receivedSignal?.aborted).toBe(true)
    } finally {
      jest.useRealTimers()
    }
  })

  it.each([
    ['fractional page count', cmsResult(1, 1.5, articleSlugs('article', 100), { total: 100 })],
    ['negative total', cmsResult(1, 0, [], { total: -1 })],
    ['unexpected page size', cmsResult(1, 1, ['article'], { pageSize: 1, total: 1 })],
    ['excessive page count', cmsResult(1, 1_001, articleSlugs('article', 100), { total: 100_000 })],
    [
      'excessive total',
      cmsResult(
        1,
        1_000,
        Array.from({ length: 100 }, () => 'article'),
        { total: 100_001 },
      ),
    ],
  ])('rejects %s without requesting another page', async (_description, result) => {
    mockGet.mockResolvedValueOnce(result)

    await expect(getAllArticleSlugs()).rejects.toThrow('invalid or excessive article pagination')
    expect(mockGet).toHaveBeenCalledTimes(1)
  })

  it('rejects a page count change without extending the enumeration loop', async () => {
    mockGet
      .mockResolvedValueOnce(cmsResult(1, 2, articleSlugs('first-page', 100), { total: 200 }))
      .mockResolvedValueOnce(cmsResult(2, 3, articleSlugs('second-page', 100), { total: 300 }))

    await expect(getAllArticleSlugs()).rejects.toThrow('pagination changed during slug enumeration on page 2')
    expect(mockGet).toHaveBeenCalledTimes(2)
  })

  it('rejects a total change between pages', async () => {
    mockGet
      .mockResolvedValueOnce(cmsResult(1, 2, articleSlugs('first-page', 100), { total: 199 }))
      .mockResolvedValueOnce(cmsResult(2, 2, articleSlugs('second-page', 100), { total: 200 }))

    await expect(getAllArticleSlugs()).rejects.toThrow('pagination changed during slug enumeration on page 2')
    expect(mockGet).toHaveBeenCalledTimes(2)
  })

  it.each([
    ['missing data array', cmsPayloadResult({ meta: { pagination: validPagination() } })],
    ['non-object article', cmsPayloadResult({ data: [null], meta: { pagination: validPagination({ total: 1 }) } })],
    [
      'non-object attributes',
      cmsPayloadResult({
        data: [{ attributes: 'invalid' }],
        meta: { pagination: validPagination({ total: 1 }) },
      }),
    ],
  ])('rejects malformed CMS data: %s', async (_description, result) => {
    mockGet.mockResolvedValueOnce(result)

    await expect(getAllArticleSlugs()).rejects.toThrow('invalid article data')
  })

  it('rejects data lengths that disagree with pagination metadata', async () => {
    mockGet.mockResolvedValueOnce(cmsResult(1, 1, ['only-article'], { total: 100 }))

    await expect(getAllArticleSlugs()).rejects.toThrow('inconsistent article data')
  })

  it('uses a deterministic order for paginated article listings', async () => {
    mockGet.mockResolvedValueOnce(cmsResult(3, 4, ['article']))

    await getArticles({ page: 3, pageSize: 24 })

    expect(mockGet).toHaveBeenCalledWith(
      '/articles',
      expect.objectContaining({
        params: {
          query: expect.objectContaining({
            sort: 'publishDate:desc,publishedAt:desc,id:desc',
          }),
        },
      }),
    )
  })

  it('fails archive enumeration instead of using a build fallback', async () => {
    const failure = new Error('CMS unavailable')
    jest.spyOn(console, 'error').mockImplementation()

    mockGet.mockResolvedValueOnce({ error: failure, response: { status: 503, url: 'https://cms.example/articles' } })

    await expect(getArticles({ page: 1, pageSize: 24 })).rejects.toBe(failure)
  })

  it('populates article categories for metadata and structured data', async () => {
    mockGet.mockResolvedValueOnce(cmsResult(1, 1, ['article']))

    await getArticleBySlug('article')

    expect(mockGet).toHaveBeenCalledWith(
      '/articles',
      expect.objectContaining({
        params: {
          query: expect.objectContaining({
            'populate[categories][fields][0]': 'name',
          }),
        },
      }),
    )
  })

  it('propagates CMS failures during production builds', async () => {
    const previousNextPhase = process.env.NEXT_PHASE
    const failure = new Error('CMS unavailable')

    process.env.NEXT_PHASE = 'phase-production-build'
    jest.resetModules()
    jest.spyOn(console, 'error').mockImplementation()
    mockGet.mockResolvedValue({ error: failure, response: { status: 503, url: 'https://cms.example/articles' } })

    try {
      const { getArticleBySlug: getBuildArticleBySlug, getArticles: getBuildArticles } = await import('./index')
      await expect(getBuildArticles({ page: 1, pageSize: 24 })).rejects.toBe(failure)
      await expect(getBuildArticleBySlug('valid-article')).rejects.toBe(failure)
    } finally {
      restoreEnvironmentVariable('NEXT_PHASE', previousNextPhase)
      jest.resetModules()
    }
  })
})

function articleSlugs(prefix: string, count: number): string[] {
  return Array.from({ length: count }, (_, index) => `${prefix}-${index + 1}`)
}

function cmsPayloadResult(data: unknown): unknown {
  return {
    data,
    error: undefined,
    response: { status: 200, url: 'https://cms.example/articles' },
  }
}

function cmsResult(
  page: number,
  pageCount: number,
  slugs: string[],
  { pageSize = 100, total = slugs.length }: { pageSize?: number; total?: number } = {},
): unknown {
  return cmsPayloadResult({
    data: slugs.map((slug, id) => ({ id, attributes: { slug } })),
    meta: { pagination: { page, pageSize, pageCount, total } },
  })
}

function restoreEnvironmentVariable(name: string, value: string | undefined): void {
  if (typeof value === 'undefined') {
    delete process.env[name]
  } else {
    process.env[name] = value
  }
}

function validPagination(
  overrides: Partial<{ page: number; pageSize: number; pageCount: number; total: number }> = {},
): { page: number; pageSize: number; pageCount: number; total: number } {
  return { page: 1, pageSize: 100, pageCount: 1, total: 1, ...overrides }
}
