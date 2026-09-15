/* eslint-disable @typescript-eslint/explicit-function-return-type */

const CMS_PAGE_SIZE = 100
const ARTICLES_PER_ARCHIVE_PAGE = 24
const CMS_SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
const CMS_REQUEST_TIMEOUT_MS = 15_000
const MAX_CMS_PAGE_COUNT = 1_000
const MAX_CMS_TOTAL = 50_000
const MAX_CMS_ARTICLE_COUNT = 50_000

function appendSitemapArticles(articles, articleCount, articlesBySlug, archiveArticles, page) {
  const nextArticleCount = articleCount + articles.length
  if (nextArticleCount > MAX_CMS_ARTICLE_COUNT) {
    throw new Error(`CMS article count exceeds sitemap limit of ${MAX_CMS_ARTICLE_COUNT}`)
  }

  for (const article of articles) {
    const validatedArticle = readSitemapArticle(article, page)
    archiveArticles.push(readArchiveArticle(validatedArticle))
    upsertCanonicalArticle(articlesBySlug, validatedArticle)
  }

  return nextArticleCount
}

function compareArticlesForArchive(left, right) {
  const publishDateOrder = compareOptionalDatesDescending(left.publishDate, right.publishDate)

  if (publishDateOrder !== 0) return publishDateOrder

  const publishedAtOrder = compareOptionalDatesDescending(left.publishedAt, right.publishedAt)

  return publishedAtOrder !== 0 ? publishedAtOrder : right.id - left.id
}

function compareOptionalDatesDescending(left, right) {
  if (left === right) return 0
  if (!left) return 1
  if (!right) return -1

  return right.localeCompare(left)
}

function createAdditionalSitemapPaths(articles, total, archiveArticles = articles) {
  validateSitemapCollections(articles, total, archiveArticles)

  const articlePaths = articles.map(({ slug, updatedAt }) => ({
    loc: `/learn/${slug}`,
    ...(updatedAt ? { lastmod: updatedAt } : {}),
  }))
  const archivePageCount = Math.ceil(total / ARTICLES_PER_ARCHIVE_PAGE)
  const archivePaths = Array.from({ length: Math.max(archivePageCount - 1, 0) }, (_, index) => {
    const page = index + 2
    const lastmod = getArchivePageLastmod(archiveArticles, page)

    return {
      loc: `/learn/articles/${page}`,
      ...(lastmod ? { lastmod } : {}),
    }
  })

  return [...articlePaths, ...archivePaths]
}

function createArticlesUrl(cmsBaseUrl, page) {
  const url = new URL(`${cmsBaseUrl.replace(/\/$/, '')}/articles`)

  url.searchParams.set('fields[0]', 'slug')
  url.searchParams.set('fields[1]', 'updatedAt')
  url.searchParams.set('fields[2]', 'publishDate')
  url.searchParams.set('fields[3]', 'publishedAt')
  url.searchParams.set('pagination[page]', String(page))
  url.searchParams.set('pagination[pageSize]', String(CMS_PAGE_SIZE))
  url.searchParams.set('publicationState', 'live')
  // Fetch in immutable ID order so publishing while this runs cannot shift records between CMS pages.
  url.searchParams.set('sort[0]', 'id:asc')

  return url.toString()
}

/**
 * Fetches every published article needed to build canonical sitemap entries.
 * The CMS is paginated, so a single request silently caps the sitemap at 100 articles.
 */
async function fetchAllSitemapArticles({
  cmsBaseUrl = process.env.NEXT_PUBLIC_CMS_BASE_URL || 'https://cms.cow.fi/api',
  fetchImpl = globalThis.fetch,
  requestTimeoutMs = CMS_REQUEST_TIMEOUT_MS,
} = {}) {
  if (typeof fetchImpl !== 'function') {
    throw new Error('A fetch implementation is required to build the sitemap')
  }
  if (!Number.isSafeInteger(requestTimeoutMs) || requestTimeoutMs <= 0) {
    throw new Error('A positive, safe request timeout is required to build the sitemap')
  }

  const articlesBySlug = new Map()
  const archiveArticles = []
  let page = 1
  let paginationSnapshot
  let articleCount = 0

  do {
    const url = createArticlesUrl(cmsBaseUrl, page)
    const payload = await fetchPageWithTimeout(fetchImpl, url, page, requestTimeoutMs)
    const pagination = readPagination(payload, page)

    paginationSnapshot = reconcilePaginationSnapshot(paginationSnapshot, pagination, page)
    articleCount = appendSitemapArticles(payload.data, articleCount, articlesBySlug, archiveArticles, page)

    page += 1
  } while (page <= paginationSnapshot.pageCount)

  if (articleCount !== paginationSnapshot.total) {
    throw new Error(
      `CMS returned ${articleCount} sitemap articles, but its pagination metadata declared ${paginationSnapshot.total}`,
    )
  }

  return {
    articles: [...articlesBySlug.values()]
      .sort(compareArticlesForArchive)
      .map(({ slug, updatedAt }) => ({ slug, updatedAt })),
    archiveArticles: archiveArticles.sort(compareArticlesForArchive).map(({ updatedAt }) => ({ updatedAt })),
    total: paginationSnapshot.total,
  }
}

async function fetchPageWithTimeout(fetchImpl, url, page, requestTimeoutMs) {
  const controller = new AbortController()
  let timeoutId
  const timeoutPromise = new Promise((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error(`Timed out fetching sitemap articles page ${page} after ${requestTimeoutMs}ms`))
      controller.abort()
    }, requestTimeoutMs)
  })

  try {
    const requestPromise = (async () => {
      const response = await fetchImpl(url, { signal: controller.signal })

      if (!response || typeof response !== 'object' || typeof response.ok !== 'boolean') {
        throw new Error(`CMS returned an invalid response for sitemap page ${page}`)
      }
      if (!response.ok) {
        throw new Error(`Unable to fetch sitemap articles from ${url}: HTTP ${response.status}`)
      }
      if (typeof response.json !== 'function') {
        throw new Error(`CMS returned an invalid response body for sitemap page ${page}`)
      }

      return response.json()
    })()

    return await Promise.race([requestPromise, timeoutPromise])
  } finally {
    clearTimeout(timeoutId)
  }
}

function getArchivePageLastmod(articles, page) {
  const start = (page - 1) * ARTICLES_PER_ARCHIVE_PAGE
  const pageArticles = articles.slice(start, start + ARTICLES_PER_ARCHIVE_PAGE)

  return pageArticles.reduce((mostRecent, article) => {
    if (!article.updatedAt) return mostRecent
    if (!mostRecent || article.updatedAt > mostRecent) return article.updatedAt

    return mostRecent
  }, undefined)
}

function hasInconsistentPagination(pagination, articleCount, requestedPage) {
  const expectedPageCount = pagination.total === 0 ? 0 : Math.ceil(pagination.total / pagination.pageSize)

  if (pagination.pageCount !== expectedPageCount) return true
  if (pagination.total === 0) return articleCount !== 0
  if (requestedPage > pagination.pageCount) return true

  const expectedArticleCount =
    requestedPage < pagination.pageCount
      ? pagination.pageSize
      : pagination.total - (pagination.pageCount - 1) * pagination.pageSize

  return articleCount !== expectedArticleCount
}

function hasInvalidPaginationShape(pagination, requestedPage) {
  return (
    !pagination ||
    !Number.isSafeInteger(pagination.page) ||
    pagination.page !== requestedPage ||
    !Number.isSafeInteger(pagination.pageSize) ||
    pagination.pageSize !== CMS_PAGE_SIZE ||
    !Number.isSafeInteger(pagination.pageCount) ||
    pagination.pageCount < 0 ||
    pagination.pageCount > MAX_CMS_PAGE_COUNT ||
    !Number.isSafeInteger(pagination.total) ||
    pagination.total < 0
  )
}

function isMoreRecent(candidate, existing) {
  if (!candidate) return false
  if (!existing) return true

  return candidate > existing
}

function isRecord(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function normalizeLastmod(value) {
  if (typeof value !== 'string') return undefined

  const timestamp = Date.parse(value)

  return Number.isNaN(timestamp) ? undefined : new Date(timestamp).toISOString()
}

function readArchiveArticle(article) {
  return {
    id: Number.isInteger(article.id) ? article.id : 0,
    publishDate: normalizeLastmod(article?.attributes?.publishDate),
    publishedAt: normalizeLastmod(article?.attributes?.publishedAt),
    updatedAt: normalizeLastmod(article?.attributes?.updatedAt),
  }
}

function readArticleCandidate(article) {
  const slug = article?.attributes?.slug

  if (typeof slug !== 'string' || !CMS_SLUG_PATTERN.test(slug)) return null

  return {
    ...readArchiveArticle(article),
    slug,
  }
}

function readPagination(payload, requestedPage) {
  const pagination = payload?.meta?.pagination

  if (!Array.isArray(payload?.data)) {
    throw new Error(`CMS returned invalid article data for sitemap page ${requestedPage}`)
  }
  if (payload.data.length > CMS_PAGE_SIZE) {
    throw new Error(`CMS returned more than ${CMS_PAGE_SIZE} articles for sitemap page ${requestedPage}`)
  }

  if (hasInvalidPaginationShape(pagination, requestedPage)) {
    throw new Error(`CMS returned invalid pagination for sitemap page ${requestedPage}`)
  }
  if (pagination.total > MAX_CMS_TOTAL) {
    throw new Error(`CMS total exceeds sitemap limit of ${MAX_CMS_TOTAL}`)
  }
  if (hasInconsistentPagination(pagination, payload.data.length, requestedPage)) {
    throw new Error(`CMS returned inconsistent pagination for sitemap page ${requestedPage}`)
  }

  return { pageCount: pagination.pageCount, pageSize: pagination.pageSize, total: pagination.total }
}

function readSitemapArticle(article, page) {
  if (!isRecord(article) || !isRecord(article.attributes)) {
    throw new Error(`CMS returned invalid article data for sitemap page ${page}`)
  }

  return article
}

function reconcilePaginationSnapshot(snapshot, pagination, page) {
  if (!snapshot) return pagination
  if (
    pagination.pageCount !== snapshot.pageCount ||
    pagination.pageSize !== snapshot.pageSize ||
    pagination.total !== snapshot.total
  ) {
    throw new Error(`CMS pagination changed while building the sitemap at page ${page}`)
  }

  return snapshot
}

function upsertCanonicalArticle(articlesBySlug, article) {
  const candidate = readArticleCandidate(article)

  if (!candidate) return

  const existing = articlesBySlug.get(candidate.slug)

  if (!existing || isMoreRecent(candidate.updatedAt, existing.updatedAt)) {
    articlesBySlug.set(candidate.slug, candidate)
  }
}

function validateSitemapCollections(articles, total, archiveArticles) {
  if (!Array.isArray(articles) || !Array.isArray(archiveArticles)) {
    throw new Error('Sitemap article collections must be arrays')
  }
  if (!Number.isSafeInteger(total) || total < 0 || total > MAX_CMS_TOTAL) {
    throw new Error(`CMS total exceeds sitemap limit of ${MAX_CMS_TOTAL}`)
  }
  if (articles.length > MAX_CMS_ARTICLE_COUNT || archiveArticles.length > MAX_CMS_ARTICLE_COUNT) {
    throw new Error(`CMS article count exceeds sitemap limit of ${MAX_CMS_ARTICLE_COUNT}`)
  }
}

module.exports = {
  createAdditionalSitemapPaths,
  fetchAllSitemapArticles,
  getArchivePageLastmod,
}
