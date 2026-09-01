import { TTLCache } from '@cowprotocol/cow-sdk'

import { querySerializer } from './querySerializer'

import {
  COINBASE_TOKENIZED_STOCKS_FALLBACK_TOKEN_LIST,
  DEFAULT_CMS_REQUEST_TTL,
  ONDO_FALLBACK_TOKEN_LIST,
  RESERVE_PROTOCOL_BNB_FALLBACK_TOKEN_LIST,
  XStocks_FALLBACK_TOKEN_LIST,
} from '../consts'
import { RestrictedTokenList, RestrictedTokenLists } from '../types'
import { getProdCmsClient } from '../utils'

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

// v1: invalidates empty responses cached from the barn CMS, which doesn't have them configured
const cache = new TTLCache<RestrictedTokenLists>('cmsRestrictedTokenLists:v1', true, DEFAULT_CMS_REQUEST_TTL)

const FALLBACK_TOKEN_LISTS: RestrictedTokenLists = [
  ONDO_FALLBACK_TOKEN_LIST,
  XStocks_FALLBACK_TOKEN_LIST,
  RESERVE_PROTOCOL_BNB_FALLBACK_TOKEN_LIST,
  COINBASE_TOKENIZED_STOCKS_FALLBACK_TOKEN_LIST,
]

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
  const cmsClient = getProdCmsClient()

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
    .then((res: { data?: CmsRestrictedTokenListsResponse; response?: Response }) => {
      const items = res.data?.data

      // openapi-fetch resolves non-2xx responses instead of rejecting, so an HTTP error arrives here
      // with no data. Geoblocking must never silently turn itself off, so fall back instead.
      if (!items) {
        throw new Error(`Restricted token lists response had no data [${res.response?.status ?? 'unknown'}]`)
      }

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
      return FALLBACK_TOKEN_LISTS
    })
}
