import { TTLCache } from '@cowprotocol/cow-sdk'

import { querySerializer } from './querySerializer'

import { DEFAULT_CMS_REQUEST_TTL, ONDO_FALLBACK_TOKEN_LIST } from '../consts'
import { RestrictedTokenList, RestrictedTokenLists } from '../types'
import { getCmsClient } from '../utils'

interface CmsRestrictedTokenListItem {
  id: number
  attributes: {
    name: string
    tokenListUrl: string
    restrictedCountries: string[]
    createdAt: string
    updatedAt: string
  }
}

interface CmsRestrictedTokenListsResponse {
  data: CmsRestrictedTokenListItem[]
}

/**
 * Request parameters are static, hence the cache key is also static
 */
const CACHE_KEY = 'restricted-token-lists'

const cache = new TTLCache<RestrictedTokenLists>('cmsRestrictedTokenLists:v0', true, DEFAULT_CMS_REQUEST_TTL)

export async function getRestrictedTokenLists(): Promise<RestrictedTokenLists> {
  const cached = cache.get(CACHE_KEY)
  if (cached !== undefined) {
    return cached
  }

  const result = await fetchRestrictedTokenLists()
  if (result) {
    cache.set(CACHE_KEY, result)
  }
  return result ?? []
}

async function fetchRestrictedTokenLists(): Promise<RestrictedTokenLists | null> {
  const cmsClient = getCmsClient()

  return cmsClient
    .GET('/restricted-token-lists', {
      params: {
        query: {
          fields: ['name', 'tokenListUrl', 'restrictedCountries'],
          pagination: { pageSize: 100 },
        },
      },
      querySerializer,
    })
    .then((res: { data: CmsRestrictedTokenListsResponse }) => {
      const items = res.data?.data
      if (!items) return []

      return items.map(
        (item): RestrictedTokenList => ({
          name: item.attributes.name,
          tokenListUrl: item.attributes.tokenListUrl,
          restrictedCountries: item.attributes.restrictedCountries,
        }),
      )
    })
    .catch((error: Error) => {
      console.error('Failed to fetch restricted token lists', error)
      return [ONDO_FALLBACK_TOKEN_LIST]
    })
}
