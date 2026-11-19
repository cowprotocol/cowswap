import { TokenWithLogo } from '@cowprotocol/common-const'
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

export function getUnknownPrioritizedTokenKeys(
  prioritizedTokens: unknown,
  chainId: number,
  tokens: TokenWithLogo[],
): string[] {
  const knownKeys = new Set(tokens.map((token) => getAddressKey(token.address)))

  return getPrioritizedTokenKeys(prioritizedTokens, chainId).filter((key) => !knownKeys.has(key))
}
