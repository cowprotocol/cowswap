import type { RwaRegistry, RwaTokenList } from './types'

const TOKEN_LIST_NAME = 'CoW RWA'

export function buildRwaTokenList(registry: RwaRegistry): RwaTokenList {
  const [major = 0, minor = 0, patch = 0] = registry.version.split('.').map(Number)

  return {
    name: TOKEN_LIST_NAME,
    timestamp: registry.lastModificationTime,
    version: { major, minor, patch },
    tokens: registry.assets.flatMap((asset) =>
      asset.tokens.map(({ chainId, address, symbol, name, decimals }) => ({
        chainId,
        address,
        symbol,
        name,
        decimals,
        extensions: { ticker: asset.ticker },
      })),
    ),
  }
}
