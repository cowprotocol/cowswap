import { mapSupportedNetworks, SupportedChainId } from '@cowprotocol/cow-sdk'
import { JsonRpcProvider } from '@ethersproject/providers'

const INFURA_KEY = process.env.REACT_APP_INFURA_KEY || '2af29cd5ac554ae3b8d991afe1ba4b7d' // Default rate-limited infura key (should be overridden, not reliable to use)

const RPC_URL_ENVS: Record<SupportedChainId, string | undefined> = {
  [SupportedChainId.MAINNET]: process.env.REACT_APP_NETWORK_URL_1 || undefined,
  [SupportedChainId.GNOSIS_CHAIN]: process.env.REACT_APP_NETWORK_URL_100 || undefined,
  [SupportedChainId.SEPOLIA]: process.env.REACT_APP_NETWORK_URL_11155111 || undefined,
}

const DEFAULT_RPC_URL: Record<SupportedChainId, { url: string; usesInfura: boolean }> = {
  [SupportedChainId.MAINNET]: { url: `https://mainnet.infura.io/v3/${INFURA_KEY}`, usesInfura: true },
  [SupportedChainId.GNOSIS_CHAIN]: { url: `https://rpc.gnosis.gateway.fm`, usesInfura: false },
  [SupportedChainId.SEPOLIA]: { url: `https://sepolia.infura.io/v3/${INFURA_KEY}`, usesInfura: true },
}

/**
 * These are the network URLs used by the interface when there is not another available source of chain data
 */
export const RPC_URLS: Record<SupportedChainId, string> = mapSupportedNetworks(getRpcUrl)

export const MAINNET_PROVIDER = new JsonRpcProvider(RPC_URLS[SupportedChainId.MAINNET])

function getRpcUrl(chainId: SupportedChainId): string {
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
