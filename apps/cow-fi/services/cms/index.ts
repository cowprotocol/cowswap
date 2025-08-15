import { components } from '@cowprotocol/cms'
import { getCmsClient } from '@cowprotocol/core'

import qs from 'qs'
import { PaginationParam } from 'types'

import { toQueryParams } from 'util/queryParams'

import { DEFAULT_PAGE_SIZE, clientAddons } from './config'
import { querySerializer, getPopulateConfig } from './helpers'

type Schemas = components['schemas']
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

export type SharedRichTextComponent = Schemas['SharedRichTextComponent']
export type Category = Schemas['CategoryListResponseDataItem']

/**
 * Open API Fetch client. See docs for usage https://openapi-ts.pages.dev/openapi-fetch/
 */
export const client = getCmsClient()

/**
 * Returns all article slugs.
 *
 * @returns Slugs
 */
export async function getAllArticleSlugs(): Promise<string[]> {
  const { data, error, response } = await client.GET('/articles', {
    params: {
      query: {
        fields: ['slug'],
        'pagination[pageSize]': DEFAULT_PAGE_SIZE,
      },
    },
    querySerializer,
    ...clientAddons,
  })

  if (error) {
    console.error(`Error ${response.status} getting article slugs: ${response.url}`, error)
    throw error
  }

  return data.data
    .filter((article: Article) => article.attributes) // Ensure attributes are defined
    .map((article: Article) => article.attributes!.slug) // Non-null assertion since we have already filtered
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
 * Returns all category slugs.
 *
 * @returns Slugs
 */
export async function getAllCategorySlugs(): Promise<string[]> {
  const categories = await getCategories()

  return categories.map((category) => category.attributes!.slug!)
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
        // Populate
        'populate[0]': 'cover',
        'populate[1]': 'blocks',
        'populate[2]': 'seo',
        'populate[3]': 'authorsBio',
        // Pagination
        'pagination[page]': page,
        'pagination[pageSize]': pageSize,
        sort: 'publishDate:desc,publishedAt:desc',
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
  const trimmedSearchTerm = searchTerm.trim()

  if (!trimmedSearchTerm) {
    return { data: [], meta: { pagination: { page, pageSize, pageCount: 0, total: 0 } } }
  }

  try {
    // Build query parameters with explicit array indices
    const queryParams = {
      'filters[$or][0][title][$startsWithi]': trimmedSearchTerm,
      'filters[$or][1][title][$containsi]': trimmedSearchTerm,
      'filters[$or][2][description][$containsi]': trimmedSearchTerm,
      'pagination[page]': page,
      'pagination[pageSize]': pageSize,
      'sort[0]': 'title:asc',
      'populate[0]': 'cover',
      'populate[1]': 'blocks',
      'populate[2]': 'seo',
      'populate[3]': 'authorsBio',
      publicationState: 'live', // Ensure published content
    }

    // Manual query string construction for absolute clarity
    const queryString = qs.stringify(queryParams, {
      encodeValuesOnly: true,
      arrayFormat: 'brackets',
      encode: false,
    })

    const url = `/articles?${queryString}`
    const { data, error, response } = await client.GET(url, clientAddons)

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

export type Page = Schemas['PageListResponseDataItem']

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

async function getBySlugAux(slug: string, endpoint: '/articles'): Promise<Article | null>
async function getBySlugAux(slug: string, endpoint: '/categories'): Promise<Category | null>
async function getBySlugAux(slug: string, endpoint: '/pages'): Promise<Page | null>

async function getBySlugAux(slug: string, endpoint: '/categories' | '/articles' | '/pages'): Promise<unknown | null> {
  if (!slug) throw new Error('Slug is required') // Fail fast - no silent failures per CMS architecture

  const entity = endpoint.slice(1, -1)
  const populate = getPopulateConfig(endpoint)

  // Build query params
  const queryParams = {
    filters: { slug: { $eq: slug } },
    pagination: { page: 1, pageSize: 2 },
    populate,
  }

  // Make API call
  const queryString = endpoint === '/pages' ? qs.stringify(queryParams, { encodeValuesOnly: true }) : null

  const { data, error } =
    endpoint === '/pages'
      ? await client.GET(`${endpoint}?${queryString}`, clientAddons)
      : await client.GET(endpoint, {
          params: { query: toQueryParams(queryParams) },
          ...clientAddons,
        })

  if (error) {
    console.error(`Error getting slug ${slug} for ${entity}`, error)
    throw error
  }

  // Handle response
  const { total } = data.meta.pagination
  if (total === 0) return null
  if (total > 1) throw new Error(`Multiple ${entity} found with slug ${slug}`)

  return data.data[0]
}
