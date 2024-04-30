import { CmsClient, components } from "@cowprotocol/cms"; 
import { PaginationParam } from "types";

const PAGE_SIZE = 50

type Schemas = components["schemas"]
export type Article = Schemas["ArticleListResponseDataItem"]
export type SharedMediaComponent = Schemas["SharedMediaComponent"]
export type SharedQuoteComponent = Schemas["SharedQuoteComponent"]
export type SharedRichTextComponent = Schemas["SharedRichTextComponent"]
export type SharedSliderComponent = Schemas["SharedSliderComponent"]
export type SharedVideoEmbedComponent = Schemas["SharedVideoEmbedComponent"]
export type Category = Schemas["CategoryListResponseDataItem"]


export type ArticleBlock = 
  SharedMediaComponent | 
  SharedQuoteComponent | 
  SharedRichTextComponent | 
  SharedSliderComponent | 
  SharedVideoEmbedComponent

  export function isSharedMediaComponent(component: ArticleBlock): component is SharedMediaComponent {
    return component.__component === 'SharedMediaComponent'
  }

  export function isSharedQuoteComponent(component: ArticleBlock): component is SharedQuoteComponent {
    return component.__component === 'SharedQuoteComponent'
  }

  export function isSharedRichTextComponent(component: ArticleBlock): component is SharedRichTextComponent {
    return component.__component === 'SharedRichTextComponent'
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
export const client = CmsClient({ 
  url: "https://cms.cow.fi/api" 
});


/**
 * Returns the article slugs for the given page.
 * 
 * @param params pagination params
 * @returns Slugs
 */
async function getArticlesSlugs(params: PaginationParam = {}): Promise<string[]> {
  const articles = await getArticles(params)  
  return articles.map((article) => article.attributes.slug)
}


/**
 * Returns all article slugs.
 * 
 * @returns Slugs
 */
export async function getAllArticleSlugs(): Promise<string[]> {
  // Fetch all pages
  const allSlugs = []
  let page = 0
  while(true) {
    const slugs = await getArticlesSlugs({ page, pageSize: PAGE_SIZE + 1 }) // Get one extra to check if there's more pages
    const hasMorePages = slugs.length > PAGE_SIZE
    allSlugs.push(hasMorePages ? slugs.slice(0, -1) : slugs)

    if (!hasMorePages) {
      break
    }

    // Keep fetching while there's more pages
    page++
  }


  return allSlugs.flat()
}

/**
 * Get articles sorted by descending published date.
 * 
 * @returns All categories 
 */
export async function getCategories(): Promise<Category[]> {
  console.log('[getCategories] get all categories')
  const { data, error, response } = await client.GET("/categories", {
    params: {
      query: {
        // Populate
        "populate": 'image',

        // Pagination
        "pagination[page]": 0,
        "pagination[pageSize]": 50, // For simplicity, we assume there's less than 50 categories (expected ~8 categories)

        // Sort
        'sort': 'name:asc',
      }
    }
  })

  
  if (error) {
    console.error(`Error ${response.status} getting categories: ${response.url}`, error)
    throw error
  }

  return data.data
}

/**
 * Returns all category slugs.
 * 
 * @returns Slugs
 */
export async function getAllCategorySlugs(): Promise<string[]> {
  const categories = await getCategories()

  return categories.map((category) => category.attributes.slug)
}


/**
 * Get articles sorted by descending published date.
 * 
 * @returns Articles for the given page
 */
export async function getArticles({ page=0, pageSize=PAGE_SIZE }: PaginationParam = {}): Promise<Article[]> {
  console.log('[getArticles] fetching page', page)
  
  const { data, error, response } = await client.GET("/articles", {
    params: {
      query: {
        // Populate
        'populate[0]': 'cover', 
        'populate[1]': 'blocks', 
        'populate[2]': 'seo', 
        'populate[3]': 'authorsBio',

        // Pagination
        "pagination[page]": page,
        "pagination[pageSize]": pageSize,
        'sort': 'publishedAt:desc',        
      }
    }
  })


  if (error) {
    console.error(`Error ${response.status} getting articles: ${response.url}. Page${page}`, error)
    throw error
  }

  return data.data
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
  return getBySlugAux(slug, '/articles')
}


/**
 * Get category by slug.
 * 
 * @param slug Slug of the category
 * 
 * @throws Error if slug is not found
 * @throws Error if multiple categorys are found with the same slug
 * 
 * @returns Article with the given slug
 */
export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  return getBySlugAux(slug, '/categories')
}



async function getBySlugAux(slug: string, endpoint: '/articles'): Promise<Article | null>;
async function getBySlugAux(slug: string, endpoint: '/categories'): Promise<Category | null>;

async function getBySlugAux(slug: string, endpoint: '/categories' | '/articles'): Promise<unknown | null> {
  if (!slug) {
    throw new Error('Slug is required')
  }
  const entity = endpoint.slice(1, -1)
  
  console.log(`[getArticleBySlug] get ${entity} for slug ${slug}`)
  const { data, error } = await client.GET(endpoint, {
    params: {

      // Use the query https://docs.strapi.io/dev-docs/api/rest/interactive-query-builder
      query: {
        // Filter by slug
        "filters[slug][$eq]": slug,

        // Populate
        'populate': 'authorsBio',

        // Pagination
        "pagination[page]": 1,
        "pagination[pageSize]": 2, // Get 2 items to check for duplicates
      }
    }
  })

  if (error)  {
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
