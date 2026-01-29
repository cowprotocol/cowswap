const FNV_OFFSET_BASIS = 0x811c9dc5
const FNV_PRIME = 0x01000193

const syntheticByAssetKey = new Map<string, string>()
const assetIdByAddressKey = new Map<string, string>()

function makeAssetKey(chainId: number, assetId: string): string {
  return `${chainId}:${assetId}`.toLowerCase()
}

function makeAddressKey(chainId: number, address: string): string {
  return `${chainId}:${address}`.toLowerCase()
}

function fnv1a32(input: string, seed: number): number {
  let hash = seed >>> 0

  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i)
    hash = Math.imul(hash, FNV_PRIME) >>> 0
  }

  return hash >>> 0
}

function hashToSyntheticAddress(input: string): string {
  // Build a deterministic 20-byte (40 hex chars) address by hashing 5 independent 32-bit words.
  let hex = ''

  for (let i = 0; i < 5; i += 1) {
    const seed = (FNV_OFFSET_BASIS + i * 0x9e3779b1) >>> 0
    const word = fnv1a32(`${i}:${input}`, seed)
    hex += word.toString(16).padStart(8, '0')
  }

  return `0x${hex.slice(0, 40)}`
}

export function createSyntheticAddress(chainId: number, assetId: string): string {
  const key = makeAssetKey(chainId, assetId)
  const existing = syntheticByAssetKey.get(key)

  if (existing) {
    return existing
  }

  const syntheticAddress = hashToSyntheticAddress(key)
  const addressKey = makeAddressKey(chainId, syntheticAddress)

  syntheticByAssetKey.set(key, syntheticAddress)
  assetIdByAddressKey.set(addressKey, assetId)

  return syntheticAddress
}

export function getSyntheticAddress(chainId: number, assetId: string): string {
  return createSyntheticAddress(chainId, assetId)
}

export function getAssetIdForSyntheticAddress(chainId: number, address: string | undefined | null): string | undefined {
  if (!address) return undefined

  return assetIdByAddressKey.get(makeAddressKey(chainId, address))
}

export function resetSyntheticAddressRegistryForTests(): void {
  syntheticByAssetKey.clear()
  assetIdByAddressKey.clear()
}
