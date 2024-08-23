import { components } from '@cowprotocol/cms'

import qs from 'qs'

import { CmsSolversInfo } from '../types'
import { getCmsClient } from '../utils'

const cmsClient = getCmsClient()

export async function getSolversInfo(): Promise<CmsSolversInfo> {
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
      return []
    })
}

const querySerializer = (params: any) => {
  return qs.stringify(params, { encodeValuesOnly: true, arrayFormat: 'brackets' })
}
