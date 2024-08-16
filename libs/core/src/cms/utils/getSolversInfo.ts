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
          filters: {
            // TODO: if we ever want to filter the query per chain, uncomment this
            //   networks: {
            //     chainId: {
            //       $eq: chainId,
            //     },
            //   },
            active: { $eq: true },
          },
          populate: {
            networks: { fields: ['chainId'] },
            image: { fields: ['url'] },
          },
          fields: ['displayName', 'solverId'],
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
