import 'server-only'

import { toAssetSummaries } from './assetSummary'
import { isListedAsset, isRwaChain } from './networks'
import { decodeRegistry } from './registryFile'

import registryJson from '../../../../data/RWAs.json'

import type { RwaAsset, RwaAssetSummary, RwaAssetType, RwaRegistry } from './types'

const registry: RwaRegistry = decodeRegistry({
  ...registryJson,
  assets: registryJson.assets.map((asset) => ({ ...asset, type: asset.type as RwaAssetType })),
})

const listedAssets = registry.assets.filter(isListedAsset).map((asset) => ({
  ...asset,
  tokens: asset.tokens.filter((token) => isRwaChain(token.chainId)),
}))
const assetsByTicker = new Map(listedAssets.map((asset) => [asset.ticker, asset]))
const assetSummaries = toAssetSummaries(listedAssets)
const allAssetSummaries = toAssetSummaries(registry.assets)

/** Every asset and token of `data/RWAs.json`, for holdings and their market data */
export function getAllAssets(): RwaAsset[] {
  return registry.assets
}

/** `getAllAssets()` without the fields a client page doesn't need */
export function getAllAssetSummaries(): RwaAssetSummary[] {
  return allAssetSummaries
}

export function getAssetByTicker(ticker: string): RwaAsset | undefined {
  return assetsByTicker.get(ticker.toUpperCase())
}

/** The listed assets: only their tokens on `RWA_CHAIN_IDS` networks, and without the assets left with none */
export function getAssets(): RwaAsset[] {
  return listedAssets
}

/** `getAssets()` without the fields a client page doesn't need */
export function getAssetSummaries(): RwaAssetSummary[] {
  return assetSummaries
}

/** Every asset and token of `data/RWAs.json` */
export function getRegistry(): RwaRegistry {
  return registry
}
