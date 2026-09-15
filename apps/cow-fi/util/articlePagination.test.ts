import {
  MAX_ARTICLE_PAGE_INDEX,
  buildArticlePageParams,
  getValidatedArticlePageData,
  getValidatedArticlePageCount,
  getValidatedArticlePagination,
  parseArticlePageIndex,
} from './articlePagination'

describe('buildArticlePageParams', () => {
  it('generates only the canonical base route and real numbered pages', () => {
    const params = buildArticlePageParams(13)

    expect(params).toHaveLength(13)
    expect(params[0]).toEqual({ pageIndex: [] })
    expect(params[1]).toEqual({ pageIndex: ['2'] })
    expect(params[12]).toEqual({ pageIndex: ['13'] })
    expect(params).not.toContainEqual({ pageIndex: ['1'] })
    expect(params).not.toContainEqual({ pageIndex: ['14'] })
  })

  it('keeps the canonical base route when the CMS has no articles', () => {
    expect(buildArticlePageParams(0)).toEqual([{ pageIndex: [] }])
  })

  it.each([-1, 1.5, Number.NaN, MAX_ARTICLE_PAGE_INDEX + 1])('fails closed for invalid page count %s', (pageCount) => {
    expect(() => buildArticlePageParams(pageCount)).toThrow('Invalid or excessive article page count')
  })
})

describe('getValidatedArticlePageCount', () => {
  it.each([0, 1, MAX_ARTICLE_PAGE_INDEX])('accepts bounded page count %s', (pageCount) => {
    expect(getValidatedArticlePageCount(pageCount)).toBe(pageCount)
  })

  it.each([-1, 1.5, Number.NaN, MAX_ARTICLE_PAGE_INDEX + 1, '2'])('rejects invalid page count %s', (pageCount) => {
    expect(() => getValidatedArticlePageCount(pageCount)).toThrow('Invalid or excessive article page count')
  })
})

describe('getValidatedArticlePagination', () => {
  const pagination = { page: 1, pageSize: 24, pageCount: 3, total: 72 }

  it('accepts bounded and internally consistent CMS pagination', () => {
    expect(getValidatedArticlePagination(pagination, 1, 24)).toEqual(pagination)
  })

  it.each([
    { ...pagination, page: 2 },
    { ...pagination, pageSize: 100 },
    { ...pagination, total: Number.MAX_SAFE_INTEGER },
    { ...pagination, pageCount: MAX_ARTICLE_PAGE_INDEX + 1 },
  ])('rejects invalid or excessive pagination %#', (value) => {
    expect(() => getValidatedArticlePagination(value, 1, 24)).toThrow(/article (?:page count|pagination)/)
  })

  it('rejects a page count that disagrees with the declared total', () => {
    expect(() => getValidatedArticlePagination({ ...pagination, total: 48 }, 1, 24)).toThrow(
      'Inconsistent article pagination',
    )
  })

  it('rejects a response page beyond the declared last page', () => {
    expect(() => getValidatedArticlePagination({ page: 3, pageSize: 24, pageCount: 2, total: 48 }, 3, 24)).toThrow(
      'Inconsistent article pagination',
    )
  })
})

describe('parseArticlePageIndex', () => {
  it('maps the base route to page one', () => {
    expect(parseArticlePageIndex()).toBe(1)
    expect(parseArticlePageIndex([])).toBe(1)
  })

  it.each([
    [['2'], 2],
    [['13'], 13],
    [[MAX_ARTICLE_PAGE_INDEX.toString()], MAX_ARTICLE_PAGE_INDEX],
  ])('parses canonical numbered route %j', (pageIndex, expected) => {
    expect(parseArticlePageIndex(pageIndex)).toBe(expected)
  })

  it.each([
    [['1']],
    [['0']],
    [['02']],
    [['2abc']],
    [['2', '3']],
    [[(MAX_ARTICLE_PAGE_INDEX + 1).toString()]],
    [['9007199254740992']],
  ])('rejects noncanonical or invalid route %j', (pageIndex) => {
    expect(parseArticlePageIndex(pageIndex)).toBeNull()
  })
})

describe('getValidatedArticlePageData', () => {
  const article = { attributes: { slug: 'article' } }

  it('accepts a full non-final page', () => {
    const pagination = { page: 1, pageSize: 2, pageCount: 2, total: 3 }
    const data = [article, article]

    expect(getValidatedArticlePageData(data, pagination)).toBe(data)
  })

  it('accepts the exact remainder on the final page', () => {
    const pagination = { page: 2, pageSize: 2, pageCount: 2, total: 3 }

    expect(getValidatedArticlePageData([article], pagination)).toHaveLength(1)
  })

  it.each([null, {}, [null], [{}], [article]])('rejects malformed or incomplete data %#', (data) => {
    const pagination = { page: 1, pageSize: 2, pageCount: 2, total: 3 }

    expect(() => getValidatedArticlePageData(data, pagination)).toThrow(/invalid|inconsistent/)
  })
})
