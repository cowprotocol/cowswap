import 'server-only'

import { toAssetSummaries } from './assetSummary'

import registryJson from '../../../../data/RWAs.json'

import type { RwaAsset, RwaAssetSummary, RwaAssetType, RwaRegistry } from './types'

const registry: RwaRegistry = {
  ...registryJson,
  assets: registryJson.assets.map((asset) => ({ ...asset, type: asset.type as RwaAssetType })),
}

const assetsByTicker = new Map(registry.assets.map((asset) => [asset.ticker, asset]))
const assetSummaries = toAssetSummaries(registry.assets)

export function getAssetByTicker(ticker: string): RwaAsset | undefined {
  return assetsByTicker.get(ticker.toUpperCase())
}

export function getAssets(): RwaAsset[] {
  return registry.assets
}

/** `getAssets()` without the fields a client page doesn't need */
export function getAssetSummaries(): RwaAssetSummary[] {
  return assetSummaries
}

export function getRegistry(): RwaRegistry {
  return registry
}
