/* eslint-disable @typescript-eslint/explicit-function-return-type */

const sitemapConfig = require('./next-sitemap.config')
const { createAdditionalSitemapPaths, fetchAllSitemapArticles, getArchivePageLastmod } = require('./sitemap-articles')

describe('next-sitemap config', () => {
  it('emits one crawler-compatible sitemap and excludes non-page URLs', () => {
    expect(sitemapConfig.generateIndexSitemap).toBe(false)
    expect(sitemapConfig.autoLastmod).toBe(false)
    expect(sitemapConfig.exclude).toEqual(['/api/*', '/robots.txt', '/learn/articles/*'])
    expect(sitemapConfig.additionalPaths).toEqual(expect.any(Function))
  })
})

describe('fetchAllSitemapArticles', () => {
  it('fetches every CMS page and returns unique canonical slugs', async () => {
    const firstPageFillers = invalidCmsArticles('first-page', 98)
    const secondPageFillers = invalidCmsArticles('second-page', 98)
    const fetchImpl = jest
      .fn()
      .mockResolvedValueOnce(
        cmsResponse({
          page: 1,
          pageCount: 3,
          total: 202,
          articles: [
            cmsArticle('newest-article', '2026-08-31T21:00:21.741Z'),
            cmsArticle('duplicate-article', '2026-08-01T00:00:00.000Z'),
            ...firstPageFillers,
          ],
        }),
      )
      .mockResolvedValueOnce(
        cmsResponse({
          page: 2,
          pageCount: 3,
          total: 202,
          articles: [
            cmsArticle('duplicate-article', '2026-08-15T00:00:00.000Z'),
            cmsArticle('Not Canonical', '2026-08-20T00:00:00.000Z'),
            ...secondPageFillers,
          ],
        }),
      )
      .mockResolvedValueOnce(
        cmsResponse({
          page: 3,
          pageCount: 3,
          total: 202,
          articles: [cmsArticle('oldest-article', 'invalid-date'), cmsArticle('final-article', null)],
        }),
      )

    const result = await fetchAllSitemapArticles({ cmsBaseUrl: 'https://cms.example/api/', fetchImpl })

    expect(result.articles).toEqual([
      { slug: 'newest-article', updatedAt: '2026-08-31T21:00:21.741Z' },
      { slug: 'duplicate-article', updatedAt: '2026-08-15T00:00:00.000Z' },
      { slug: 'oldest-article', updatedAt: undefined },
      { slug: 'final-article', updatedAt: undefined },
    ])
    expect(result.archiveArticles).toHaveLength(202)
    expect(result.total).toBe(202)

    expect(fetchImpl).toHaveBeenCalledTimes(3)
    expect(fetchImpl.mock.calls.map(([url]) => new URL(url).searchParams.get('pagination[page]'))).toEqual([
      '1',
      '2',
      '3',
    ])
    expect(new URL(fetchImpl.mock.calls[0][0]).searchParams.get('sort[0]')).toBe('id:asc')
  })

  it('fails instead of publishing a partial sitemap', async () => {
    const fetchImpl = jest
      .fn()
      .mockResolvedValueOnce(
        cmsResponse({ page: 1, pageCount: 2, total: 200, articles: invalidCmsArticles('first-page', 100) }),
      )
      .mockResolvedValueOnce({ ok: false, status: 503 })

    await expect(fetchAllSitemapArticles({ fetchImpl })).rejects.toThrow('HTTP 503')
  })

  it.each([
    { pageCount: Number.MAX_SAFE_INTEGER, total: 1, expectedError: 'invalid pagination' },
    { pageCount: 1, total: Number.MAX_SAFE_INTEGER, expectedError: 'total exceeds sitemap limit' },
  ])('rejects unbounded CMS pagination metadata %#', async ({ pageCount, total, expectedError }) => {
    const fetchImpl = jest.fn().mockResolvedValue(
      cmsResponse({
        page: 1,
        pageCount,
        total,
        articles: [cmsArticle('article')],
      }),
    )

    await expect(fetchAllSitemapArticles({ fetchImpl })).rejects.toThrow(expectedError)
  })

  it('rejects an oversized article page before accumulating it', async () => {
    const articles = Array.from({ length: 101 }, (_, index) => cmsArticle(`article-${index}`))
    const fetchImpl = jest.fn().mockResolvedValue(cmsResponse({ page: 1, pageCount: 2, total: 101, articles }))

    await expect(fetchAllSitemapArticles({ fetchImpl })).rejects.toThrow('more than 100 articles')
  })

  it('rejects a CMS page-size downgrade', async () => {
    const fetchImpl = jest.fn().mockResolvedValue(
      cmsResponse({
        page: 1,
        pageCount: 1,
        pageSize: 1,
        total: 1,
        articles: [cmsArticle('article')],
      }),
    )

    await expect(fetchAllSitemapArticles({ fetchImpl })).rejects.toThrow('invalid pagination')
    expect(fetchImpl).toHaveBeenCalledTimes(1)
  })

  it.each([
    { pageCount: 1, total: 100, articles: invalidCmsArticles('short-page', 99) },
    { pageCount: 1, total: 101, articles: invalidCmsArticles('wrong-page-count', 100) },
  ])('rejects pagination metadata that disagrees with page cardinality %#', async (testCase) => {
    const fetchImpl = jest.fn().mockResolvedValue(cmsResponse({ page: 1, ...testCase }))

    await expect(fetchAllSitemapArticles({ fetchImpl })).rejects.toThrow('inconsistent pagination')
    expect(fetchImpl).toHaveBeenCalledTimes(1)
  })

  it.each([null, 1, {}, { attributes: null }, { attributes: [] }])(
    'rejects malformed CMS article data %#',
    async (article) => {
      const fetchImpl = jest
        .fn()
        .mockResolvedValue(cmsResponse({ page: 1, pageCount: 1, total: 1, articles: [article] }))

      await expect(fetchAllSitemapArticles({ fetchImpl })).rejects.toThrow(
        'CMS returned invalid article data for sitemap page 1',
      )
    },
  )

  it.each([
    { firstPageCount: 2, firstTotal: 200, secondPageCount: 3, secondTotal: 300 },
    { firstPageCount: 2, firstTotal: 199, secondPageCount: 2, secondTotal: 200 },
  ])('rejects pagination metadata that changes while fetching %#', async (testCase) => {
    const { firstPageCount, firstTotal, secondPageCount, secondTotal } = testCase
    const fetchImpl = jest
      .fn()
      .mockResolvedValueOnce(
        cmsResponse({
          page: 1,
          pageCount: firstPageCount,
          total: firstTotal,
          articles: invalidCmsArticles('first-page', 100),
        }),
      )
      .mockResolvedValueOnce(
        cmsResponse({
          page: 2,
          pageCount: secondPageCount,
          total: secondTotal,
          articles: invalidCmsArticles('second-page', 100),
        }),
      )

    await expect(fetchAllSitemapArticles({ fetchImpl })).rejects.toThrow(
      'CMS pagination changed while building the sitemap at page 2',
    )
    expect(fetchImpl).toHaveBeenCalledTimes(2)
  })

  it('aborts a stalled CMS request after the configured timeout', async () => {
    let receivedSignal
    const fetchImpl = jest.fn((_url, { signal }) => {
      receivedSignal = signal
      return new Promise(() => undefined)
    })

    await expect(fetchAllSitemapArticles({ fetchImpl, requestTimeoutMs: 10 })).rejects.toThrow(
      'Timed out fetching sitemap articles page 1 after 10ms',
    )
    expect(receivedSignal).toBeDefined()
    expect(receivedSignal.aborted).toBe(true)
  })

  it('aborts a stalled CMS response body after the configured timeout', async () => {
    let receivedSignal
    const fetchImpl = jest.fn((_url, { signal }) => {
      receivedSignal = signal
      return Promise.resolve({
        ok: true,
        status: 200,
        json: jest.fn(() => new Promise(() => undefined)),
      })
    })

    await expect(fetchAllSitemapArticles({ fetchImpl, requestTimeoutMs: 10 })).rejects.toThrow(
      'Timed out fetching sitemap articles page 1 after 10ms',
    )
    expect(receivedSignal).toBeDefined()
    expect(receivedSignal.aborted).toBe(true)
  })
})

describe('sitemap path generation', () => {
  const articles = Array.from({ length: 49 }, (_, index) => ({
    slug: `article-${index + 1}`,
    updatedAt: new Date(Date.UTC(2026, 7, 31 - index)).toISOString(),
  }))

  it('adds all articles and only canonical archive pages', () => {
    const paths = createAdditionalSitemapPaths(articles, 49)

    expect(paths).toHaveLength(51)
    expect(paths).toContainEqual({ loc: '/learn/article-1', lastmod: articles[0].updatedAt })
    expect(paths).toContainEqual({ loc: '/learn/articles/2', lastmod: articles[24].updatedAt })
    expect(paths).toContainEqual({ loc: '/learn/articles/3', lastmod: articles[48].updatedAt })
    expect(paths).not.toContainEqual(expect.objectContaining({ loc: '/learn/articles/1' }))
    expect(paths).not.toContainEqual(expect.objectContaining({ loc: '/learn/articles/4' }))
  })

  it('uses the most recent CMS update represented on each archive page', () => {
    expect(getArchivePageLastmod(articles, 2)).toBe(articles[24].updatedAt)
  })

  it('rejects an unbounded total before allocating archive paths', () => {
    expect(() => createAdditionalSitemapPaths([], Number.MAX_SAFE_INTEGER, [])).toThrow(
      'CMS total exceeds sitemap limit',
    )
  })

  it('rejects an unbounded article collection before mapping it', () => {
    expect(() => createAdditionalSitemapPaths(new Array(50_001), 50_000, [])).toThrow(
      'CMS article count exceeds sitemap limit',
    )
  })
})

function cmsArticle(slug, updatedAt = '2026-08-01T00:00:00.000Z') {
  return { attributes: { slug, updatedAt } }
}

function cmsResponse({ page, pageCount, pageSize = 100, total, articles }) {
  return {
    ok: true,
    status: 200,
    json: jest.fn().mockResolvedValue({
      data: articles,
      meta: { pagination: { page, pageSize, pageCount, total } },
    }),
  }
}

function invalidCmsArticles(prefix, count) {
  return Array.from({ length: count }, (_, index) => cmsArticle(`Invalid ${prefix} ${index + 1}`))
}
