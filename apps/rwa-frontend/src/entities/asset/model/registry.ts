import registryJson from '../../../../data/RWAs.json'

import type { RwaAsset, RwaAssetType, RwaRegistry } from './types'

const registry: RwaRegistry = {
  ...registryJson,
  assets: registryJson.assets.map((asset) => ({ ...asset, type: asset.type as RwaAssetType })),
}

const assetsByTicker = new Map(registry.assets.map((asset) => [asset.ticker, asset]))

export function getAssetByTicker(ticker: string): RwaAsset | undefined {
  return assetsByTicker.get(ticker.toUpperCase())
}

export function getAssets(): RwaAsset[] {
  return registry.assets
}

export function getRegistry(): RwaRegistry {
  return registry
}
