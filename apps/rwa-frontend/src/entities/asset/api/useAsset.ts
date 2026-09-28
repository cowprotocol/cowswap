import useSWR, { type SWRResponse } from 'swr'

import { getAssetUrl } from './assetsApi'

import type { RwaAssetWithMarket } from '../model/types'

const MARKET_REFRESH_INTERVAL_MS = 60_000

export function useAsset(ticker: string): SWRResponse<RwaAssetWithMarket, Error> {
  return useSWR<RwaAssetWithMarket, Error>(getAssetUrl(ticker), { refreshInterval: MARKET_REFRESH_INTERVAL_MS })
}
