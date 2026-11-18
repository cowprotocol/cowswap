import { RWA_SECTOR_SEPARATOR } from './sectors'

import type { RwaAsset } from './types'

export type RwaRelatedAsset = Pick<RwaAsset, 'ticker' | 'title' | 'logoUrl'>

/**
 * Up to `limit` assets of the groups of `asset`: its industry, its sector and its asset type. Each group is a ring in
 * ticker order, and `asset` first takes the next asset of each group, so every asset of a group of two or more is linked
 * from another asset page. The other slots go to the closest group first
 */
export function getRelatedAssets(asset: RwaAsset, assets: RwaAsset[], limit: number): RwaRelatedAsset[] {
  const rings = getGroupKeys(asset).map((key) => getRing(asset, assets, key))
  const picked = new Map<string, { item: RwaAsset; group: number }>()
  const pick = (group: number): void => {
    const item = rings[group].find(({ ticker }) => !picked.has(ticker))

    if (item && picked.size < limit) picked.set(item.ticker, { item, group })
  }

  rings.forEach((_, group) => pick(group))
  rings.forEach((ring, group) => ring.forEach(() => pick(group)))

  return [...picked.values()]
    .sort((a, b) => a.group - b.group)
    .map(({ item: { ticker, title, logoUrl } }) => ({ ticker, title, logoUrl }))
}

function compareTickers(a: RwaAsset, b: RwaAsset): number {
  return a.ticker < b.ticker ? -1 : a.ticker > b.ticker ? 1 : 0
}

/** Industry, then sector, then asset type */
function getGroupKeys({ type, profile }: RwaAsset): string[] {
  const keys = [`type:${type}`]

  if (!profile) return keys

  const [sector] = profile.sector.split(RWA_SECTOR_SEPARATOR)

  return [`industry:${profile.sector}`, `sector:${sector}`, ...keys]
}

/** The other assets of the group, starting after `asset` and wrapping around */
function getRing(asset: RwaAsset, assets: RwaAsset[], key: string): RwaAsset[] {
  const group = assets.filter((item) => getGroupKeys(item).includes(key)).sort(compareTickers)
  const index = group.findIndex(({ ticker }) => ticker === asset.ticker)

  return [...group.slice(index + 1), ...group.slice(0, Math.max(index, 0))].filter(
    ({ ticker }) => ticker !== asset.ticker,
  )
}
