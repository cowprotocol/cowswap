import { getAddressKey } from '@cowprotocol/cow-sdk'

export function getPrioritizedTokenKeys(prioritizedTokens: unknown, chainId: number | undefined): string[] {
  if (chainId === undefined || typeof prioritizedTokens !== 'object' || prioritizedTokens === null) return []

  const addresses: unknown = (prioritizedTokens as Record<number, unknown>)[chainId]

  if (!Array.isArray(addresses)) return []

  const keys = addresses
    .filter((address): address is string => typeof address === 'string' && address.trim().length > 0)
    .map((address) => getAddressKey(address.trim()))

  return [...new Set(keys)]
}
