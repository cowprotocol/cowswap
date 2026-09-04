export type ArticlePageParams = { pageIndex: string[] }

export interface ArticlePaginationMetadata {
  page: number
  pageSize: number
  pageCount: number
  total: number
}

// Generous ceiling that bounds both route parsing and static-parameter allocation.
export const MAX_ARTICLE_PAGE_INDEX = 10_000

export function buildArticlePageParams(pageCount: number): ArticlePageParams[] {
  const lastPage = Math.max(getValidatedArticlePageCount(pageCount), 1)

  return [
    { pageIndex: [] },
    ...Array.from({ length: lastPage - 1 }, (_, index) => ({
      pageIndex: [(index + 2).toString()],
    })),
  ]
}

export function getValidatedArticlePageCount(pageCount: unknown): number {
  if (
    typeof pageCount !== 'number' ||
    !Number.isSafeInteger(pageCount) ||
    pageCount < 0 ||
    pageCount > MAX_ARTICLE_PAGE_INDEX
  ) {
    throw new Error(`Invalid or excessive article page count: ${String(pageCount)}`)
  }

  return pageCount
}

export function getValidatedArticlePageData<T>(data: unknown, pagination: ArticlePaginationMetadata): T[] {
  if (!Array.isArray(data) || data.some((article) => !hasRecordAttributes(article))) {
    throw new Error(`CMS returned invalid article data on page ${pagination.page}`)
  }

  const expectedArticleCount =
    pagination.total === 0
      ? 0
      : pagination.page < pagination.pageCount
        ? pagination.pageSize
        : pagination.total - (pagination.pageCount - 1) * pagination.pageSize

  if (data.length !== expectedArticleCount) {
    throw new Error(`CMS returned inconsistent article data on page ${pagination.page}`)
  }

  return data as T[]
}

export function getValidatedArticlePagination(
  pagination: ArticlePaginationMetadata,
  expectedPage: number,
  expectedPageSize: number,
): ArticlePaginationMetadata {
  const { page, pageSize, pageCount, total } = pagination
  const maximumTotal = MAX_ARTICLE_PAGE_INDEX * expectedPageSize

  if (hasInvalidArticlePaginationFields(page, pageSize, total, expectedPage, expectedPageSize, maximumTotal)) {
    throw new Error('Invalid or excessive article pagination')
  }

  const validatedPageCount = getValidatedArticlePageCount(pageCount)
  const calculatedPageCount = total === 0 ? 0 : Math.ceil(total / pageSize)

  if (hasInconsistentArticlePagination(page, total, validatedPageCount, calculatedPageCount)) {
    throw new Error('Inconsistent article pagination')
  }

  return { page, pageSize, pageCount: validatedPageCount, total }
}

export function parseArticlePageIndex(pageIndex?: string[]): number | null {
  if (!pageIndex || pageIndex.length === 0) return 1
  if (pageIndex.length !== 1) return null

  const value = pageIndex[0]
  if (!/^[1-9]\d*$/.test(value)) return null

  const page = Number(value)
  return Number.isSafeInteger(page) && page > 1 && page <= MAX_ARTICLE_PAGE_INDEX ? page : null
}

function hasInconsistentArticlePagination(
  page: number,
  total: number,
  pageCount: number,
  calculatedPageCount: number,
): boolean {
  const pageIsWithinRange = total === 0 ? page === 1 : page <= pageCount
  return pageCount !== calculatedPageCount || !pageIsWithinRange
}

function hasInvalidArticlePaginationFields(
  page: number,
  pageSize: number,
  total: number,
  expectedPage: number,
  expectedPageSize: number,
  maximumTotal: number,
): boolean {
  return ![
    Number.isSafeInteger(page),
    page === expectedPage,
    Number.isSafeInteger(pageSize),
    pageSize === expectedPageSize,
    Number.isSafeInteger(total),
    total >= 0,
    total <= maximumTotal,
  ].every(Boolean)
}

function hasRecordAttributes(value: unknown): boolean {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return false

  const attributes = (value as Record<string, unknown>).attributes
  return typeof attributes === 'object' && attributes !== null && !Array.isArray(attributes)
}
