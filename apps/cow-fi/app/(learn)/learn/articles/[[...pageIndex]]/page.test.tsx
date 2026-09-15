const mockGetArticles = jest.fn()
const mockGetCategories = jest.fn()

jest.mock('../../../../../services/cms', () => ({
  getArticles: (...args: unknown[]) => mockGetArticles(...args),
  getCategories: (...args: unknown[]) => mockGetCategories(...args),
}))

jest.mock('next/navigation', () => ({
  notFound: jest.fn(() => {
    throw new Error('NEXT_NOT_FOUND')
  }),
}))

jest.mock('@/components/ArticlesPageComponents', () => ({
  ArticlesPageComponents: jest.fn(() => null),
}))

import { notFound } from 'next/navigation'

import Page, * as pageModule from './page'

import { ARTICLES_PER_PAGE } from '@/const/pagination'
import { MAX_ARTICLE_PAGE_INDEX } from '@/util/articlePagination'

const article = {
  id: 1,
  attributes: {
    title: 'Article',
    description: 'Description',
    slug: 'article',
    featured: false,
    publishDateVisible: true,
    cover: {},
    blocks: [],
  },
}

interface MockArticlesResponse {
  data: (typeof article)[]
  meta: {
    pagination: {
      page: number
      pageSize: number
      pageCount: number
      total: number
    }
  }
}

describe('article archive page', () => {
  beforeEach(() => {
    mockGetArticles.mockReset()
    mockGetCategories.mockReset().mockResolvedValue([])
    jest.mocked(notFound).mockClear()
  })

  it('leaves dynamic params enabled so future CMS pages can render through ISR', () => {
    expect(pageModule).not.toHaveProperty('dynamicParams')
  })

  it('reuses the page-one availability response when rendering the base route', async () => {
    mockGetArticles
      .mockResolvedValueOnce(articlesResponse({ page: 1, pageCount: 3 }))
      .mockResolvedValueOnce(articlesResponse({ page: 1, pageCount: 3 }))

    const result = await Page({ params: Promise.resolve({ pageIndex: [] }) })

    expect(mockGetArticles).toHaveBeenCalledTimes(2)
    expect(mockGetArticles).toHaveBeenNthCalledWith(1, { page: 1, pageSize: ARTICLES_PER_PAGE })
    expect(mockGetArticles).toHaveBeenNthCalledWith(2, { pageSize: 100 })
    expect(result).toHaveProperty('props.currentPage', 1)
  })

  it('checks page availability before fetching a valid later page', async () => {
    mockGetArticles
      .mockResolvedValueOnce(articlesResponse({ page: 1, pageCount: 3 }))
      .mockResolvedValueOnce(articlesResponse({ page: 2, pageCount: 3 }))
      .mockResolvedValueOnce(articlesResponse({ page: 1, pageCount: 3 }))

    const result = await Page({ params: Promise.resolve({ pageIndex: ['2'] }) })

    expect(mockGetArticles).toHaveBeenCalledTimes(3)
    expect(mockGetArticles).toHaveBeenNthCalledWith(1, { page: 1, pageSize: ARTICLES_PER_PAGE })
    expect(mockGetArticles).toHaveBeenNthCalledWith(2, { page: 2, pageSize: ARTICLES_PER_PAGE })
    expect(mockGetArticles).toHaveBeenNthCalledWith(3, { pageSize: 100 })
    expect(result).toHaveProperty('props.currentPage', 2)
  })

  it('returns not-found for a phantom page without querying that page', async () => {
    mockGetArticles.mockResolvedValueOnce(articlesResponse({ page: 1, pageCount: 2 }))

    await expect(Page({ params: Promise.resolve({ pageIndex: ['3'] }) })).rejects.toThrow('NEXT_NOT_FOUND')

    expect(notFound).toHaveBeenCalledTimes(1)
    expect(mockGetArticles).toHaveBeenCalledTimes(1)
    expect(mockGetArticles).toHaveBeenCalledWith({ page: 1, pageSize: ARTICLES_PER_PAGE })
    expect(mockGetCategories).not.toHaveBeenCalled()
  })

  it('returns not-found when the CMS has no articles', async () => {
    mockGetArticles.mockResolvedValueOnce(articlesResponse({ page: 1, pageCount: 0, total: 0 }))

    await expect(Page({ params: Promise.resolve({ pageIndex: [] }) })).rejects.toThrow('NEXT_NOT_FOUND')

    expect(mockGetArticles).toHaveBeenCalledTimes(1)
    expect(mockGetCategories).not.toHaveBeenCalled()
  })

  it('fails closed for malformed CMS pagination without a page-specific query', async () => {
    mockGetArticles.mockResolvedValueOnce(articlesResponse({ page: 1, pageCount: Number.NaN }))

    await expect(Page({ params: Promise.resolve({ pageIndex: ['2'] }) })).rejects.toThrow(
      'Invalid or excessive article pagination',
    )

    expect(mockGetArticles).toHaveBeenCalledTimes(1)
    expect(mockGetArticles).toHaveBeenCalledWith({ page: 1, pageSize: ARTICLES_PER_PAGE })
    expect(notFound).not.toHaveBeenCalled()
  })

  it('allows a self-consistent CMS total change after the availability check', async () => {
    mockGetArticles
      .mockResolvedValueOnce(articlesResponse({ page: 1, pageCount: 3, total: 71 }))
      .mockResolvedValueOnce(articlesResponse({ page: 2, pageCount: 3, total: 72 }))
      .mockResolvedValueOnce(articlesResponse({ page: 1, pageCount: 1, total: 1 }))

    const result = await Page({ params: Promise.resolve({ pageIndex: ['2'] }) })

    expect(result).toHaveProperty('props.currentPage', 2)
    expect(result).toHaveProperty('props.totalArticles', 72)
  })

  it('fails closed if the requested page disappears after the availability check', async () => {
    mockGetArticles
      .mockResolvedValueOnce(articlesResponse({ page: 1, pageCount: 3 }))
      .mockResolvedValueOnce(articlesResponse({ page: 2, pageCount: 1, total: 24 }))

    await expect(Page({ params: Promise.resolve({ pageIndex: ['2'] }) })).rejects.toThrow(
      'Inconsistent article pagination',
    )

    expect(mockGetArticles).toHaveBeenCalledTimes(2)
    expect(mockGetCategories).not.toHaveBeenCalled()
  })

  it('fails closed when the CMS returns a partial archive page', async () => {
    mockGetArticles
      .mockResolvedValueOnce(articlesResponse({ page: 1, pageCount: 2, total: 25 }))
      .mockResolvedValueOnce(articlesResponse({ page: 2, pageCount: 2, total: 25, articleCount: 2 }))

    await expect(Page({ params: Promise.resolve({ pageIndex: ['2'] }) })).rejects.toThrow(
      'CMS returned inconsistent article data on page 2',
    )

    expect(mockGetArticles).toHaveBeenCalledTimes(2)
    expect(mockGetCategories).not.toHaveBeenCalled()
  })

  it('rejects an absurd page index before making any CMS request', async () => {
    await expect(
      Page({ params: Promise.resolve({ pageIndex: [(MAX_ARTICLE_PAGE_INDEX + 1).toString()] }) }),
    ).rejects.toThrow('NEXT_NOT_FOUND')

    expect(mockGetArticles).not.toHaveBeenCalled()
    expect(mockGetCategories).not.toHaveBeenCalled()
  })
})

function articlesResponse({
  page,
  pageCount,
  total = pageCount * ARTICLES_PER_PAGE,
  articleCount = total === 0 ? 0 : page < pageCount ? ARTICLES_PER_PAGE : total - (pageCount - 1) * ARTICLES_PER_PAGE,
}: {
  page: number
  pageCount: number
  total?: number
  articleCount?: number
}): MockArticlesResponse {
  return {
    data: Array.from({ length: articleCount }, (_, index) => ({
      ...article,
      id: index + 1,
      attributes: { ...article.attributes, slug: `article-${index + 1}` },
    })),
    meta: {
      pagination: {
        page,
        pageSize: ARTICLES_PER_PAGE,
        pageCount,
        total,
      },
    },
  }
}
