import { CmsClient, components } from '@cowprotocol/cms'
import { PaginationParam } from 'types'
import qs from 'qs'

import { toQueryParams } from 'util/queryParams'
import { getCmsClient } from '@cowprotocol/core'

const PAGE_SIZE = 50

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

export type SharedMediaComponent = Schemas['SharedMediaComponent']
export type SharedQuoteComponent = Schemas['SharedQuoteComponent']
export type SharedRichTextComponent = Schemas['SharedRichTextComponent']
export type SharedSliderComponent = Schemas['SharedSliderComponent']
export type SharedVideoEmbedComponent = Schemas['SharedVideoEmbedComponent']
export type Category = Schemas['CategoryListResponseDataItem']
export type ArticleCover = Schemas['Article']['cover']
export type ArticleBlocks = Schemas['Article']['blocks']

export type ArticleBlock =
  | SharedMediaComponent
  | SharedQuoteComponent
  | SharedRichTextComponent
  | SharedSliderComponent
  | SharedVideoEmbedComponent

export function isSharedMediaComponent(component: ArticleBlock): component is SharedMediaComponent {
  return component.__component === 'SharedMediaComponent'
}

export function isSharedQuoteComponent(component: ArticleBlock): component is SharedQuoteComponent {
  return component.__component === 'SharedQuoteComponent'
}

export function isSharedRichTextComponent(component: ArticleBlock): component is SharedRichTextComponent {
  return component.__component === 'shared.rich-text'
}

export function isSharedSliderComponent(component: ArticleBlock): component is SharedMediaComponent {
  return component.__component === 'SharedSliderComponent'
}

export function isSharedVideoEmbedComponent(component: ArticleBlock): component is SharedVideoEmbedComponent {
  return component.__component === 'SharedVideoEmbedComponent'
}

/**
 * Open API Fetch client. See docs for usage https://openapi-ts.pages.dev/openapi-fetch/
 */
export const client = getCmsClient()

/**
 * Returns the article slugs for the given page.
 *
 * @param params pagination params
 * @returns Slugs
 */
async function getArticlesSlugs(params: PaginationParam = {}): Promise<string[]> {
  const articlesResponse = await getArticles(params)
  return articlesResponse.data.map((article: Article) => article.attributes!.slug!)
}

/**
 * Returns all article slugs.
 *
 * @returns Slugs
 */
export async function getAllArticleSlugs(): Promise<string[]> {
  const querySerializer = (params: any) => {
    return qs.stringify(params, { encodeValuesOnly: true, arrayFormat: 'brackets' })
  }

  const { data, error, response } = await client.GET('/articles', {
    params: {
      query: {
        fields: ['slug'],
        'pagination[pageSize]': 100, // Adjust the page size as needed
      },
    },
    querySerializer,
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
          pageSize: 50,
        },
        sort: 'name:asc',
      },
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
  pageSize = PAGE_SIZE,
  filters = {},
}: PaginationParam & { filters?: any } = {}): Promise<ArticleListResponse> {
  const querySerializer = (params: any) => {
    return qs.stringify(params, { encodeValuesOnly: true, arrayFormat: 'brackets' })
  }

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
  })

  if (error) {
    console.error(`Error ${response.status} getting articles: ${response.url}. Page ${page}`, error)
    throw error
  }

  return { data: data.data, meta: data.meta }
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
  const querySerializer = (params: any) => {
    return qs.stringify(params, { encodeValuesOnly: true, arrayFormat: 'brackets' })
  }

  const { data, error, response } = await client.GET(`/articles`, {
    params: {
      query: {
        filters: {
          slug: {
            $eq: slug,
          },
        },
        populate: ['cover', 'blocks', 'seo', 'authorsBio', 'categories'],
      },
    },
    querySerializer,
  })

  if (error) {
    console.error(`Error ${response.status} getting article by slug: ${response.url}`, error)
    throw error
  }

  const articles = data.data
  if (articles.length === 0) {
    return null
  }

  return articles[0]
}

/**
 * Get category by slug.
 *
 * @param slug Slug of the category
 *
 * @throws Error if slug is not found
 * @throws Error if multiple categories are found with the same slug
 *
 * @returns Article with the given slug
 */
export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  return getBySlugAux(slug, '/categories')
}

async function getBySlugAux(slug: string, endpoint: '/articles'): Promise<Article | null>
async function getBySlugAux(slug: string, endpoint: '/categories'): Promise<Category | null>

async function getBySlugAux(slug: string, endpoint: '/categories' | '/articles'): Promise<unknown | null> {
  if (!slug) {
    throw new Error('Slug is required')
  }
  const entity = endpoint.slice(1, -1)

  const populate =
    endpoint === '/categories'
      ? // Category
        {
          articles: {
            populate: {
              authorsBio: {
                fields: ['name'],
              },
              seo: '*',
            },
          },
          image: { fields: ['url'] }, // Ensure the image is populated
        }
      : // Articles
        {
          cover: {
            fields: ['url', 'width', 'height', 'alternativeText'],
          },
          blocks: '*',
          seo: {
            fields: ['metaTitle', 'metaDescription'],
            populate: {
              shareImage: {
                fields: ['url'],
              },
            },
          },
          authorsBio: {
            fields: ['name'],
          },
        }

  const query = toQueryParams({
    filters: {
      slug: {
        $eq: slug,
      },
    },

    pagination: {
      page: 1,
      pageSize: 2,
    },

    populate,
  })

  // console.log(`[getBySlugAux] get ${entity} for slug ${slug}`, query)

  const { data, error } = await client.GET(endpoint, {
    params: {
      query,
    },
  })

  if (error) {
    console.error(`Error getting slug ${slug} for ${entity}`, error)
    throw error
  }

  const { total } = data.meta.pagination

  if (total === 0) {
    return null
  }

  if (total > 1) {
    throw new Error(`Multiple ${entity} found with slug ${slug}`)
  }

  return data.data[0]
}
