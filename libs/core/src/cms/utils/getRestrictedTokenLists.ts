import { querySerializer } from './querySerializer'

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

export async function getRestrictedTokenLists(): Promise<RestrictedTokenLists> {
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
      return [] as RestrictedTokenLists
    })
}
