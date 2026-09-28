import useSWR, { type SWRResponse } from 'swr'

import { type AssetsPageQuery, getAssetsUrl } from './assetsApi'

import type { RwaAssetsPage } from '../model/types'

export function useAssetsPage(query: AssetsPageQuery): SWRResponse<RwaAssetsPage, Error> {
  return useSWR<RwaAssetsPage, Error>(getAssetsUrl(query))
}
