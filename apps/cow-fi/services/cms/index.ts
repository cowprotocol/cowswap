import { components } from '@cowprotocol/cms'
import { isRecord } from '@cowprotocol/common-utils/json-utils'
import { getCmsClient } from '@cowprotocol/core'

import { PaginationParam } from 'types'

import { isValidCmsSlug, normalizeSearchArticlesInput } from 'util/cmsValidation'
import { toQueryParams } from 'util/queryParams'

import { DEFAULT_PAGE_SIZE, clientAddons } from './config'
import { querySerializer, getPopulateConfig } from './helpers'

export type Article = Schemas['ArticleListResponseDataItem']
export type ArticleListResponse = {
  data: Article[]
  meta: {
    pagination: {
      page: number
      pageSize: number
      pageCount: number
      total: number
    }
  }
}

export type Category = Schemas['CategoryListResponseDataItem']

export type SharedRichTextComponent = Schemas['SharedRichTextComponent']

type Schemas = components['schemas']

const ARTICLE_ENUMERATION_REQUEST_TIMEOUT_MS = 15_000
const MAX_ARTICLE_ENUMERATION_PAGES = 1_000
const MAX_ARTICLE_ENUMERATION_TOTAL = 100_000

type ArticleEnumerationClientResult = Awaited<ReturnType<typeof client.GET>>

type ArticleEnumerationPage = {
  articles: Record<string, unknown>[]
  pagination: ArticleEnumerationPagination
}

type ArticleEnumerationPagination = {
  page: number
  pageSize: number
  pageCount: number
  total: number
}

/**
 * Open API Fetch client. See docs for usage https://openapi-ts.pages.dev/openapi-fetch/
 */
export const client = getCmsClient()

export type Page = Schemas['PageListResponseDataItem']

/**
 * Returns all article slugs.
 *
 * @returns Slugs
 */
export async function getAllArticleSlugs(): Promise<string[]> {
  // Static route enumeration must be complete. Let failures abort the build
  // instead of deploying a release with a partial CMS-backed route manifest.
  const slugs = new Set<string>()
  let page = 1
  let paginationSnapshot: ArticleEnumerationPagination | null = null
  let enumeratedArticleCount = 0

  do {
    const { data, error, response } = await fetchArticleEnumerationPage(page)

    if (error) {
      console.error(`Error ${response.status} getting article slugs: ${response.url}. Page ${page}`, error)
      throw error
    }

    const enumerationPage = readArticleEnumerationPage(data, page)
    paginationSnapshot = getArticleEnumerationSnapshot(paginationSnapshot, enumerationPage.pagination, page)

    for (const article of enumerationPage.articles) {
      const slug = readArticleSlug(article, page)

      if (slug && isValidCmsSlug(slug)) {
        slugs.add(slug)
      }
    }

    enumeratedArticleCount += enumerationPage.articles.length
    page += 1
  } while (page <= paginationSnapshot.pageCount)

  if (enumeratedArticleCount !== paginationSnapshot.total) {
    throw new Error('CMS article count changed during slug enumeration')
  }

  return [...slugs]
}

/**
 * Returns all category slugs.
 *
 * @returns Slugs
 */
export async function getAllCategorySlugs(): Promise<string[]> {
  const categories = await getCategories()

  return categories.flatMap((category) => {
    const slug = category.attributes?.slug
    return typeof slug === 'string' && isValidCmsSlug(slug) ? [slug] : []
  })
}

/**
 * Get article by slug.
 *
 * @param slug Slug of the article
 *
 * @throws Error if slug is not found
 * @throws Error if multiple articles are found with the same slug
 *
 * @returns Article with the given slug
 */
export async function getArticleBySlug(slug: string): Promise<Article | null> {
  if (!slug) throw new Error('Article slug is required') // Fail fast - no silent failures per CMS architecture

  try {
    const result = await getBySlugAux(slug, '/articles')
    return result
  } catch (error) {
    console.error(`Error getting article by slug ${slug}:`, error)
    throw error
  }
}

/**
 * Get articles sorted by descending published date.
 *
 * @returns Articles for the given page
 */
export async function getArticles({
  page = 0,
  pageSize = DEFAULT_PAGE_SIZE,
  filters = {},
}: PaginationParam & { filters?: Record<string, unknown> } = {}): Promise<ArticleListResponse> {
  const { data, error, response } = await client.GET('/articles', {
    params: {
      query: {
        'populate[0]': 'cover',
        'populate[1]': 'blocks',
        'populate[2]': 'seo',
        'populate[3]': 'authorsBio',
        'populate[4]': 'categories',
        'pagination[page]': page,
        'pagination[pageSize]': pageSize,
        sort: 'publishDate:desc,publishedAt:desc,id:desc',
        filters,
      },
    },
    querySerializer,
    ...clientAddons,
  })

  if (error) {
    console.error(`Error ${response.status} getting articles: ${response.url}. Page ${page}`, error)
    throw error
  }

  return { data: data.data, meta: data.meta }
}

/**
 * Get categories with images.
 *
 * @returns Categories with their associated images
 */
export async function getCategories(): Promise<Category[]> {
  try {
    const { data, error, response } = await client.GET('/categories?populate=*', {
      params: {
        pagination: {
          page: 0,
          pageSize: DEFAULT_PAGE_SIZE,
        },
        sort: 'name:asc',
      },
      ...clientAddons,
    })

    if (error) {
      console.error(`Error ${response.status} getting categories: ${response.url}`, error)
      throw error
    }

    return data.data
  } catch (err) {
    console.error('An unexpected error occurred:', err)
    throw err
  }
}

/**
 * Get category by slug.
 *
 * @param slug Slug of the category
 *
 * @throws Error if slug is not found
 * @throws Error if multiple categories are found with the same slug
 *
 * @returns Category with the given slug
 */
export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  return getBySlugAux(slug, '/categories')
}

/**
 * Get page by slug.
 *
 * @param slug Slug of the page
 *
 * @throws Error if slug is not found
 * @throws Error if multiple pages are found with the same slug
 *
 * @returns Page with the given slug
 */
export async function getPageBySlug(slug: string): Promise<Page | null> {
  return getBySlugAux(slug, '/pages')
}

/**
 * Search for articles containing a search term across multiple fields.
 * Uses Strapi's filtering capabilities to perform the search server-side.
 *
 * @param searchTerm The term to search for
 * @param page The page number (0-indexed)
 * @param pageSize The number of articles per page
 * @returns Articles matching the search term with pagination info
 */
export async function searchArticles({
  searchTerm,
  page = 0,
  pageSize = DEFAULT_PAGE_SIZE,
}: {
  searchTerm: string
  page?: number
  pageSize?: number
}): Promise<ArticleListResponse> {
  const {
    searchTerm: trimmedSearchTerm,
    page: normalizedPage,
    pageSize: normalizedPageSize,
  } = normalizeSearchArticlesInput({ searchTerm, page, pageSize })

  if (!trimmedSearchTerm) {
    return {
      data: [],
      meta: { pagination: { page: normalizedPage, pageSize: normalizedPageSize, pageCount: 0, total: 0 } },
    }
  }

  try {
    const queryParams = {
      filters: {
        $or: [
          { title: { $startsWithi: trimmedSearchTerm } },
          { title: { $containsi: trimmedSearchTerm } },
          { description: { $containsi: trimmedSearchTerm } },
        ],
      },
      pagination: {
        page: normalizedPage,
        pageSize: normalizedPageSize,
      },
      sort: ['title:asc'],
      populate: ['cover', 'blocks', 'seo', 'authorsBio'],
      publicationState: 'live', // Ensure published content
    }

    const { data, error, response } = await client.GET('/articles', {
      params: {
        query: toQueryParams(queryParams),
      },
      ...clientAddons,
    })

    if (error) {
      console.error(`Search failed (${response.status}):`, error)
      throw new Error(`Search failed: ${error.message}`)
    }

    return { data: data.data, meta: data.meta }
  } catch (error) {
    console.error('Search error:', error)
    throw new Error('Unable to complete search. Please try again.')
  }
}

async function fetchArticleEnumerationPage(page: number): Promise<ArticleEnumerationClientResult> {
  const controller = new AbortController()
  let timeoutId: ReturnType<typeof setTimeout> | undefined
  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(
        new Error(
          `Timed out fetching CMS article slugs page ${page} after ${ARTICLE_ENUMERATION_REQUEST_TIMEOUT_MS}ms`,
        ),
      )
      controller.abort()
    }, ARTICLE_ENUMERATION_REQUEST_TIMEOUT_MS)
  })

  try {
    const requestPromise = client.GET('/articles', {
      params: {
        query: {
          fields: ['slug'],
          'pagination[page]': page,
          'pagination[pageSize]': DEFAULT_PAGE_SIZE,
          sort: 'id:asc',
        },
      },
      querySerializer,
      signal: controller.signal,
      ...clientAddons,
    })

    return await Promise.race([requestPromise, timeoutPromise])
  } finally {
    if (typeof timeoutId !== 'undefined') clearTimeout(timeoutId)
  }
}

function getArticleEnumerationSnapshot(
  snapshot: ArticleEnumerationPagination | null,
  pagination: ArticleEnumerationPagination,
  page: number,
): ArticleEnumerationPagination {
  if (snapshot === null) return pagination

  if (pagination.pageCount !== snapshot.pageCount) {
    throw new Error(`CMS article pagination changed during slug enumeration on page ${page}`)
  }

  if (pagination.pageSize !== snapshot.pageSize) {
    throw new Error(`CMS article pagination changed during slug enumeration on page ${page}`)
  }

  if (pagination.total !== snapshot.total) {
    throw new Error(`CMS article pagination changed during slug enumeration on page ${page}`)
  }

  return snapshot
}

async function getBySlugAux(slug: string, endpoint: '/articles'): Promise<Article | null>
async function getBySlugAux(slug: string, endpoint: '/categories'): Promise<Category | null>
async function getBySlugAux(slug: string, endpoint: '/pages'): Promise<Page | null>
async function getBySlugAux(slug: string, endpoint: '/categories' | '/articles' | '/pages'): Promise<unknown | null> {
  if (!slug) throw new Error('Slug is required') // Fail fast - no silent failures per CMS architecture
  if (!isValidCmsSlug(slug)) return null

  const entity = endpoint.slice(1, -1)
  const populate = getPopulateConfig(endpoint)

  const queryParams = {
    filters: { slug: { $eq: slug } },
    pagination: { page: 1, pageSize: 2 },
    populate,
  }

  const { data, error } = await client.GET(endpoint, {
    params: { query: toQueryParams(queryParams) },
    ...clientAddons,
  })

  if (error) {
    console.error(`Error getting slug ${slug} for ${entity}`, error)
    throw error
  }

  const { total } = data.meta.pagination
  if (total === 0) return null
  if (total > 1) throw new Error(`Multiple ${entity} found with slug ${slug}`)

  return data.data[0]
}

function readArticleEnumerationPage(payload: unknown, requestedPage: number): ArticleEnumerationPage {
  if (!isRecord(payload) || !isRecord(payload.meta)) {
    throw new Error(`CMS returned invalid article data during slug enumeration on page ${requestedPage}`)
  }

  const pagination = readArticleEnumerationPagination(payload.meta.pagination, requestedPage)
  const articles = readEnumerationArticles(payload.data, pagination, requestedPage)

  return { articles, pagination }
}

function readArticleEnumerationPagination(payload: unknown, requestedPage: number): ArticleEnumerationPagination {
  if (!isRecord(payload)) {
    throw new Error(`CMS returned invalid article pagination on page ${requestedPage}`)
  }

  const page = readBoundedInteger(payload.page, 1, MAX_ARTICLE_ENUMERATION_PAGES, requestedPage)
  const pageSize = readBoundedInteger(payload.pageSize, DEFAULT_PAGE_SIZE, DEFAULT_PAGE_SIZE, requestedPage)
  const pageCount = readBoundedInteger(payload.pageCount, 0, MAX_ARTICLE_ENUMERATION_PAGES, requestedPage)
  const total = readBoundedInteger(payload.total, 0, MAX_ARTICLE_ENUMERATION_TOTAL, requestedPage)

  if (page !== requestedPage) {
    throw new Error(`CMS returned inconsistent article pagination on page ${requestedPage}`)
  }

  const calculatedPageCount = total === 0 ? 0 : Math.ceil(total / pageSize)

  if (pageCount !== calculatedPageCount) {
    throw new Error(`CMS returned inconsistent article pagination on page ${requestedPage}`)
  }

  if (pageCount === 0 && requestedPage !== 1) {
    throw new Error(`CMS returned inconsistent article pagination on page ${requestedPage}`)
  }

  if (pageCount > 0 && requestedPage > pageCount) {
    throw new Error(`CMS returned inconsistent article pagination on page ${requestedPage}`)
  }

  return { page, pageSize, pageCount, total }
}

function readArticleSlug(article: Record<string, unknown>, page: number): string | null {
  const attributes = article.attributes

  if (!isRecord(attributes)) {
    throw new Error(`CMS returned invalid article data during slug enumeration on page ${page}`)
  }

  return typeof attributes.slug === 'string' ? attributes.slug : null
}

function readBoundedInteger(value: unknown, minimum: number, maximum: number, page: number): number {
  if (typeof value !== 'number' || !Number.isSafeInteger(value)) {
    throw new Error(`CMS returned invalid or excessive article pagination on page ${page}`)
  }

  if (value < minimum || value > maximum) {
    throw new Error(`CMS returned invalid or excessive article pagination on page ${page}`)
  }

  return value
}

function readEnumerationArticles(
  payload: unknown,
  pagination: ArticleEnumerationPagination,
  requestedPage: number,
): Record<string, unknown>[] {
  if (!Array.isArray(payload)) {
    throw new Error(`CMS returned invalid article data during slug enumeration on page ${requestedPage}`)
  }

  const articles = payload.flatMap((article) => (isRecord(article) ? [article] : []))

  if (articles.length !== payload.length) {
    throw new Error(`CMS returned invalid article data during slug enumeration on page ${requestedPage}`)
  }

  const { pageCount, pageSize, total } = pagination
  const expectedArticleCount =
    total === 0 ? 0 : requestedPage < pageCount ? pageSize : total - (pageCount - 1) * pageSize

  if (articles.length !== expectedArticleCount) {
    throw new Error(`CMS returned inconsistent article data on page ${requestedPage}`)
  }

  return articles
}
