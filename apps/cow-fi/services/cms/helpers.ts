import qs from 'qs'

interface PopulateConfig {
  [key: string]: unknown
}

// Helper function for query serialization
export const querySerializer = (params: unknown): string => {
  return qs.stringify(params, { encodeValuesOnly: true, arrayFormat: 'brackets' })
}

// Helper function to get populate configuration for different endpoints
export function getPopulateConfig(endpoint: '/categories' | '/articles' | '/pages'): PopulateConfig {
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
      return { contentSections: '*', metadata: '*' }
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
  }
}
