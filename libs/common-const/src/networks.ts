import { EvmChains, HttpsString } from '@cowprotocol/cow-sdk'

const INFURA_KEY = process.env['REACT_APP_INFURA_KEY'] || '2af29cd5ac554ae3b8d991afe1ba4b7d' // Default rate-limited infura key (should be overridden, not reliable to use)

const RPC_URL_ENVS: Record<EvmChains, HttpsString | undefined> = {
  [EvmChains.MAINNET]: (process.env['REACT_APP_NETWORK_URL_1'] as HttpsString) || undefined,
  [EvmChains.BNB]: (process.env['REACT_APP_NETWORK_URL_56'] as HttpsString) || undefined,
  [EvmChains.GNOSIS_CHAIN]: (process.env['REACT_APP_NETWORK_URL_100'] as HttpsString) || undefined,
  [EvmChains.POLYGON]: (process.env['REACT_APP_NETWORK_URL_137'] as HttpsString) || undefined,
  [EvmChains.BASE]: (process.env['REACT_APP_NETWORK_URL_8453'] as HttpsString) || undefined,
  [EvmChains.PLASMA]: (process.env['REACT_APP_NETWORK_URL_9745'] as HttpsString) || undefined,
  [EvmChains.ARBITRUM_ONE]: (process.env['REACT_APP_NETWORK_URL_42161'] as HttpsString) || undefined,
  [EvmChains.AVALANCHE]: (process.env['REACT_APP_NETWORK_URL_43114'] as HttpsString) || undefined,
  [EvmChains.INK]: (process.env['REACT_APP_NETWORK_URL_57073'] as HttpsString) || undefined,
  [EvmChains.LINEA]: (process.env['REACT_APP_NETWORK_URL_59144'] as HttpsString) || undefined,
  [EvmChains.SEPOLIA]: (process.env['REACT_APP_NETWORK_URL_11155111'] as HttpsString) || undefined,
  // OPTIMISM is bridge-only (not in `SupportedChainId`). Carried here so RPC_URLS satisfies
  // `Record<EvmChains, ...>` ahead of the Solana-aware SDK migration; CoW Protocol does not
  // sell from Optimism today.
  [EvmChains.OPTIMISM]: (process.env['REACT_APP_NETWORK_URL_10'] as HttpsString) || undefined,
}

const DEFAULT_RPC_URL: Record<EvmChains, { url: HttpsString; usesInfura: boolean }> = {
  [EvmChains.MAINNET]: { url: `https://mainnet.infura.io/v3/${INFURA_KEY}`, usesInfura: true },
  [EvmChains.BNB]: { url: `https://bsc-mainnet.infura.io/v3/${INFURA_KEY}`, usesInfura: true },
  [EvmChains.GNOSIS_CHAIN]: { url: `https://rpc.gnosis.gateway.fm`, usesInfura: false },
  [EvmChains.POLYGON]: { url: `https://polygon-mainnet.infura.io/v3/${INFURA_KEY}`, usesInfura: true },
  [EvmChains.BASE]: { url: `https://base-mainnet.infura.io/v3/${INFURA_KEY}`, usesInfura: true },
  [EvmChains.PLASMA]: { url: `https://rpc.plasma.to`, usesInfura: false },
  [EvmChains.ARBITRUM_ONE]: { url: `https://arbitrum-mainnet.infura.io/v3/${INFURA_KEY}`, usesInfura: true },
  [EvmChains.AVALANCHE]: { url: `https://avalanche-mainnet.infura.io/v3/${INFURA_KEY}`, usesInfura: true },
  [EvmChains.INK]: { url: `https://rpc-ten.inkonchain.com`, usesInfura: false },
  [EvmChains.LINEA]: { url: `https://rpc.linea.build`, usesInfura: false },
  [EvmChains.SEPOLIA]: { url: `https://sepolia.infura.io/v3/${INFURA_KEY}`, usesInfura: true },
  [EvmChains.OPTIMISM]: { url: `https://mainnet.optimism.io`, usesInfura: false },
}

/**
 * Network URLs used when no other source of chain data is available.
 *
 * Keyed by `EvmChains` to keep non-EVM chains (Solana) out of EVM-only transports.
 * Includes `OPTIMISM` because it lives in `EvmChains`; on-chain trading there is not
 * supported by CoW Protocol today and its entry is a stub for future migration.
 */
// todo this will be replaced when pr https://github.com/cowprotocol/cow-sdk/pull/873 be merged
export const RPC_URLS: Record<EvmChains, HttpsString> = (Object.keys(RPC_URL_ENVS) as unknown as EvmChains[]).reduce(
  (acc, chainId) => {
    acc[Number(chainId) as EvmChains] = getRpcUrl(Number(chainId) as EvmChains)
    return acc
  },
  {} as Record<EvmChains, HttpsString>,
)

function getRpcUrl(chainId: EvmChains): HttpsString {
  const envKey = `REACT_APP_NETWORK_URL_${chainId}`
  const rpcUrl = RPC_URL_ENVS[chainId]

  if (rpcUrl) {
    return rpcUrl
  }

  const defaultRpc = DEFAULT_RPC_URL[chainId]
  if (defaultRpc.usesInfura && !INFURA_KEY) {
    throw new Error(`Either ${envKey} or REACT_APP_INFURA_KEY environment variable are required`)
  }

  return defaultRpc.url
}
