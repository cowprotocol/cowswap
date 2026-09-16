import qs from 'qs'

export interface CmsPageResult<T> {
  items: T[]
  page: number
  pageCount: number
}

interface PopulateConfig {
  [key: string]: unknown
}

const MAX_CMS_PAGES = 1000

// Helper function for query serialization
export const querySerializer = (params: unknown): string => {
  return qs.stringify(params, { encodeValuesOnly: true, arrayFormat: 'brackets' })
}

export async function collectAllPages<T>(fetchPage: (page: number) => Promise<CmsPageResult<T>>): Promise<T[]> {
  const allItems: T[] = []
  let page = 1
  let hasMore = true

  while (hasMore && page <= MAX_CMS_PAGES) {
    const result = await fetchPage(page)
    allItems.push(...result.items)
    hasMore = result.page < result.pageCount && result.items.length > 0
    page += 1
  }

  return allItems
}

// Helper function to get populate configuration for different endpoints
export function getPopulateConfig(endpoint: '/categories' | '/articles' | '/pages' | '/resources'): PopulateConfig {
  switch (endpoint) {
    case '/categories':
      return {
        articles: {
          populate: {
            authorsBio: { fields: ['name'] },
            seo: '*',
          },
        },
        image: { fields: ['url'] },
      }
    case '/pages':
      return { contentSections: '*' }
    case '/articles':
      return {
        cover: { fields: ['url', 'width', 'height', 'alternativeText'] },
        blocks: '*',
        seo: {
          fields: ['metaTitle', 'metaDescription'],
          populate: { shareImage: { fields: ['url'] } },
        },
        authorsBio: { fields: ['name'] },
      }
    case '/resources':
      return {
        cover: { fields: ['url', 'width', 'height', 'alternativeText'] },
        blocks: '*',
        seo: {
          fields: ['metaTitle', 'metaDescription'],
          populate: { shareImage: { fields: ['url'] } },
        },
      }
  }
}

export function toResourceSlugParams(
  resources: Array<{
    attributes?: {
      campaign?: string | null
      slug?: string | null
    } | null
  }>,
): Array<{ campaign: string; slug: string }> {
  return resources.flatMap((resource) => {
    const campaign = resource.attributes?.campaign
    const slug = resource.attributes?.slug

    if (!campaign || !slug) {
      return []
    }

    return [{ campaign, slug }]
  })
}
