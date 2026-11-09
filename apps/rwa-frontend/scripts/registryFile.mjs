/**
 * Reads and writes data/RWAs.json, which keeps `allowedTradingTime` and `profile.sector` values in the top-level
 * `allowedTradingTimes` and `sectors` maps, referenced by number key. Same format as `registryFile.ts`.
 */
import { readFile, rename, writeFile } from 'node:fs/promises'

const MAP_KEY_REGEX = /^(0|[1-9]\d*)$/

/** The registry with values in place of keys, plus the maps it was read from to keep their keys on write */
export async function readRegistry(path) {
  const { allowedTradingTimes = {}, sectors = {}, ...file } = JSON.parse(await readFile(path, 'utf8'))
  for (const [name, map] of Object.entries({ allowedTradingTimes, sectors })) {
    const invalidKey = Object.keys(map).find((key) => !MAP_KEY_REGEX.test(key))
    if (invalidKey !== undefined) throw new Error(`${path} ${name}: key ${JSON.stringify(invalidKey)} is not a number`)
  }
  const lookup = (map, key, label) => {
    if (!Number.isInteger(key)) throw new Error(`${path} ${label}: key ${JSON.stringify(key)} is not a number`)
    if (map[key] === undefined) throw new Error(`${path} ${label}: unknown key ${key}`)
    return map[key]
  }

  const registry = {
    ...file,
    assets: file.assets.map((asset) => ({
      ...asset,
      allowedTradingTime:
        asset.allowedTradingTime === undefined
          ? undefined
          : lookup(allowedTradingTimes, asset.allowedTradingTime, `${asset.ticker}.allowedTradingTime`),
      profile: asset.profile && {
        ...asset.profile,
        sector: lookup(sectors, asset.profile.sector, `${asset.ticker}.profile.sector`),
      },
    })),
  }

  return { registry, maps: { allowedTradingTimes, sectors } }
}

/** Through a temp file and a rename, so an interrupted write leaves a valid registry */
export async function writeRegistry(path, registry, maps) {
  const tempPath = `${path}.tmp`
  await writeFile(tempPath, `${JSON.stringify(encodeRegistry(registry, maps), null, 2)}\n`)
  await rename(tempPath, path)
}

/** Keeps the keys of `maps` for values still in use, numbers new values from the highest key, drops unused ones */
export function encodeRegistry(registry, maps = { allowedTradingTimes: {}, sectors: {} }) {
  const tradingTimes = createKeyMap(maps.allowedTradingTimes)
  const sectors = createKeyMap(maps.sectors)

  const assets = registry.assets.map((asset) => ({
    ...asset,
    allowedTradingTime:
      asset.allowedTradingTime === undefined ? undefined : tradingTimes.keyOf(asset.allowedTradingTime),
    profile: asset.profile && { ...asset.profile, sector: sectors.keyOf(asset.profile.sector) },
  }))
  const { assets: _assets, ...rest } = registry

  return { ...rest, allowedTradingTimes: tradingTimes.toObject(), sectors: sectors.toObject(), assets }
}

function createKeyMap(previous) {
  const keysByValue = new Map(Object.entries(previous).map(([key, value]) => [JSON.stringify(value), Number(key)]))
  const used = new Map()
  let nextKey = Math.max(-1, ...keysByValue.values()) + 1

  return {
    keyOf(value) {
      const id = JSON.stringify(value)
      let key = keysByValue.get(id)
      if (key === undefined) {
        key = nextKey++
        keysByValue.set(id, key)
      }
      used.set(key, value)

      return key
    },
    toObject() {
      return Object.fromEntries([...used].sort(([a], [b]) => a - b))
    },
  }
}
