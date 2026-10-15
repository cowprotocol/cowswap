import type { RwaAsset } from '@/entities/asset'

/** `null` unless the asset has tokens on the `chainId` query param */
export function parseAssetChainId(asset: RwaAsset, searchParams: URLSearchParams): number | null {
  const chainId = Number(searchParams.get('chainId'))

  return asset.tokens.some((token) => token.chainId === chainId) ? chainId : null
}
