import { getTokenKey } from './tokenKey'

import type { RwaToken } from '../model/types'

/** Search param of the asset page with the `getTokenKey` of the token to trade */
export const ASSET_TOKEN_SEARCH_PARAM = 'token'

export function getAssetPath(ticker: string, token?: Pick<RwaToken, 'chainId' | 'address'>): string {
  const path = `/asset/${ticker}`

  if (!token) return path

  return `${path}?${new URLSearchParams({ [ASSET_TOKEN_SEARCH_PARAM]: getTokenKey(token) })}`
}
