import type { RwaAsset, RwaAssetSummary } from './types'

export function toAssetSummaries(assets: RwaAsset[]): RwaAssetSummary[] {
  return assets.map(({ ticker, title, logoUrl, type, tokens }) => ({
    ticker,
    title,
    ...(logoUrl ? { logoUrl } : {}),
    type,
    tokens: tokens.map(({ chainId, address, symbol, decimals, issuer }) => ({
      chainId,
      address,
      symbol,
      decimals,
      issuer,
    })),
  }))
}
