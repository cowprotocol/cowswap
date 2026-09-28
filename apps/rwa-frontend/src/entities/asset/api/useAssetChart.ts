import useSWR, { type SWRResponse } from 'swr'

import { getChartUrl } from './assetsApi'

import type { RwaChart, RwaChartRange } from '../model/types'

export function useAssetChart(ticker: string, range: RwaChartRange): SWRResponse<RwaChart, Error> {
  return useSWR<RwaChart, Error>(getChartUrl(ticker, range), { revalidateOnFocus: false })
}
