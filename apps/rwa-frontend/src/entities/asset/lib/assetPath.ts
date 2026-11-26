import { getTokenKey } from './tokenKey'

import type { RwaToken } from '../model/types'

/** Search param of the asset page with the `getTokenKey` of the token to trade */
export const ASSET_TOKEN_SEARCH_PARAM = 'token'
/** Search param of the asset page with the page its back link returns to */
export const ASSET_FROM_SEARCH_PARAM = 'from'

export type AssetPageOrigin = 'portfolio'

interface AssetPathOptions {
  token?: Pick<RwaToken, 'chainId' | 'address'>
  from?: AssetPageOrigin
}

export function getAssetPath(ticker: string, { token, from }: AssetPathOptions = {}): string {
  const params = new URLSearchParams()

  if (token) params.set(ASSET_TOKEN_SEARCH_PARAM, getTokenKey(token))
  if (from) params.set(ASSET_FROM_SEARCH_PARAM, from)

  const search = params.toString()

  return search ? `/asset/${ticker}?${search}` : `/asset/${ticker}`
}
