import { components } from '@cowprotocol/cms'
import { TTLCache } from '@cowprotocol/cow-sdk'

import { querySerializer } from './querySerializer'

import { DEFAULT_CMS_REQUEST_TTL } from '../consts'
import { CmsSolversInfo } from '../types'
import { getCmsClient } from '../utils'

/**
 * Request parameters are static, hence the cache key is also static
 */
const CACHE_KEY = 'solvers-info'

const cache = new TTLCache<CmsSolversInfo>('cmsSolversInfo:v0', true, DEFAULT_CMS_REQUEST_TTL)

export async function getSolversInfo(): Promise<CmsSolversInfo> {
  const cached = cache.get(CACHE_KEY)
  if (cached !== undefined) {
    return cached
  }

  const result = await fetchSolversInfo()
  if (result !== null) {
    cache.set(CACHE_KEY, result)
  }
  return result ?? []
}

async function fetchSolversInfo(): Promise<CmsSolversInfo | null> {
  const cmsClient = getCmsClient()

  return cmsClient
    .GET('/solvers', {
      params: {
        query: {
          populate: {
            solver_networks: {
              fields: ['active'],
              populate: {
                network: {
                  fields: ['chainId'],
                },
                environment: {
                  fields: ['name'],
                },
              },
            },
            image: { fields: ['url'] },
          },
          fields: ['displayName', 'solverId', 'description'],
          pagination: { pageSize: 100 },
        },
      },
      querySerializer,
    })
    .then((res: { data: components['schemas']['SolverListResponse'] }) => res.data?.data)
    .catch((error: Error) => {
      console.error('Failed to fetch solvers', error)
      return null
    })
}
