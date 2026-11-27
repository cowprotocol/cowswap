import type { RwaAsset, RwaAssetProfile, RwaRegistry, RwaTradingTime } from './types'

export interface RwaAssetFile extends Omit<RwaAsset, 'allowedTradingTime' | 'profile'> {
  /** Key of `RwaRegistryFile.allowedTradingTimes` */
  allowedTradingTime?: number
  profile?: RwaAssetProfileFile
}

export interface RwaAssetProfileFile extends Omit<RwaAssetProfile, 'sector'> {
  /** Key of `RwaRegistryFile.sectors` */
  sector: number
}

/** `data/RWAs.json`: `RwaRegistry` with repeated values moved to top-level maps and referenced by key */
export interface RwaRegistryFile extends Omit<RwaRegistry, 'assets'> {
  allowedTradingTimes: Record<string, RwaTradingTime>
  sectors: Record<string, string>
  assets: RwaAssetFile[]
}

/** Throws on a key missing from its map */
export function decodeRegistry(file: RwaRegistryFile): RwaRegistry {
  const { allowedTradingTimes, sectors, ...rest } = file

  return {
    ...rest,
    assets: file.assets.map(({ allowedTradingTime, profile, ...asset }) => ({
      ...asset,
      ...(allowedTradingTime === undefined
        ? {}
        : {
            allowedTradingTime: lookup(allowedTradingTimes, allowedTradingTime, `${asset.ticker}.allowedTradingTime`),
          }),
      ...(profile
        ? { profile: { ...profile, sector: lookup(sectors, profile.sector, `${asset.ticker}.profile.sector`) } }
        : {}),
    })),
  }
}

function lookup<T>(map: Record<string, T>, key: number, path: string): T {
  const value = map[key]
  if (value === undefined) throw new Error(`RWAs.json ${path}: unknown key ${key}`)

  return value
}
