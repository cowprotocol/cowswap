import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { JsonRpcProvider } from '@ethersproject/providers'

const INFURA_KEY = process.env.REACT_APP_INFURA_KEY

const DEFAULT_RPC_URL: Record<SupportedChainId, { url: string; usesInfura: boolean }> = {
  [SupportedChainId.MAINNET]: { url: `https://mainnet.infura.io/v3/${INFURA_KEY}`, usesInfura: true },
  [SupportedChainId.GNOSIS_CHAIN]: { url: `https://rpc.gnosis.gateway.fm`, usesInfura: false },
  [SupportedChainId.GOERLI]: { url: `https://goerli.infura.io/v3/${INFURA_KEY}`, usesInfura: true },
}

/**
 * These are the network URLs used by the interface when there is not another available source of chain data
 */
export const RPC_URLS = {
  [SupportedChainId.MAINNET]: getRpcUrl(SupportedChainId.MAINNET),
  [SupportedChainId.GNOSIS_CHAIN]: getRpcUrl(SupportedChainId.GNOSIS_CHAIN),
  [SupportedChainId.GOERLI]: getRpcUrl(SupportedChainId.GOERLI),
}

export const MAINNET_PROVIDER = new JsonRpcProvider(RPC_URLS[SupportedChainId.MAINNET])

function getRpcUrl(chainId: SupportedChainId): string {
  const envKey = `REACT_APP_NETWORK_URL_${chainId}`
  const rpcUrl = process.env[envKey]

  console.log('RPC', { envKey, rpcUrl, INFURA_KEY })

  if (rpcUrl) {
    return rpcUrl
  }

  const defaultRpc = DEFAULT_RPC_URL[chainId]
  if (defaultRpc.usesInfura && !INFURA_KEY) {
    throw new Error(`Either ${envKey} or REACT_APP_INFURA_KEY environment variable are required`)
  }

  return defaultRpc.url
}

console.log('RPC_URLS', RPC_URLS)
