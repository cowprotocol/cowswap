import { mapSupportedNetworks, SupportedChainId } from '@cowprotocol/cow-sdk'
import { HttpsString } from '@cowprotocol/cow-sdk'

const INFURA_KEY = process.env['REACT_APP_INFURA_KEY'] || '2af29cd5ac554ae3b8d991afe1ba4b7d' // Default rate-limited infura key (should be overridden, not reliable to use)

const RPC_URL_ENVS: Record<SupportedChainId, HttpsString | undefined> = {
  [SupportedChainId.MAINNET]: (process.env['REACT_APP_NETWORK_URL_1'] as HttpsString) || undefined,
  [SupportedChainId.BNB]: (process.env['REACT_APP_NETWORK_URL_56'] as HttpsString) || undefined,
  [SupportedChainId.GNOSIS_CHAIN]: (process.env['REACT_APP_NETWORK_URL_100'] as HttpsString) || undefined,
  [SupportedChainId.POLYGON]: (process.env['REACT_APP_NETWORK_URL_137'] as HttpsString) || undefined,
  [SupportedChainId.LENS]: (process.env['REACT_APP_NETWORK_URL_232'] as HttpsString) || undefined,
  [SupportedChainId.BASE]: (process.env['REACT_APP_NETWORK_URL_8453'] as HttpsString) || undefined,
  [SupportedChainId.PLASMA]: (process.env['REACT_APP_NETWORK_URL_9745'] as HttpsString) || undefined,
  [SupportedChainId.ARBITRUM_ONE]: (process.env['REACT_APP_NETWORK_URL_42161'] as HttpsString) || undefined,
  [SupportedChainId.AVALANCHE]: (process.env['REACT_APP_NETWORK_URL_43114'] as HttpsString) || undefined,
  [SupportedChainId.INK]: (process.env['REACT_APP_NETWORK_URL_57073'] as HttpsString) || undefined,
  [SupportedChainId.LINEA]: (process.env['REACT_APP_NETWORK_URL_59144'] as HttpsString) || undefined,
  [SupportedChainId.SEPOLIA]: (process.env['REACT_APP_NETWORK_URL_11155111'] as HttpsString) || undefined,
}

const DEFAULT_RPC_URL: Record<SupportedChainId, { url: HttpsString; usesInfura: boolean }> = {
  [SupportedChainId.MAINNET]: { url: `https://mainnet.infura.io/v3/${INFURA_KEY}`, usesInfura: true },
  [SupportedChainId.BNB]: { url: `https://bsc-mainnet.infura.io/v3/${INFURA_KEY}`, usesInfura: true },
  [SupportedChainId.GNOSIS_CHAIN]: { url: `https://rpc.gnosis.gateway.fm`, usesInfura: false },
  [SupportedChainId.POLYGON]: { url: `https://polygon-mainnet.infura.io/v3/${INFURA_KEY}`, usesInfura: true },
  [SupportedChainId.LENS]: { url: `https://rpc.lens.xyz`, usesInfura: false },
  [SupportedChainId.BASE]: { url: `https://base-mainnet.infura.io/v3/${INFURA_KEY}`, usesInfura: true },
  [SupportedChainId.PLASMA]: { url: `https://rpc.plasma.to`, usesInfura: false },
  [SupportedChainId.ARBITRUM_ONE]: { url: `https://arbitrum-mainnet.infura.io/v3/${INFURA_KEY}`, usesInfura: true },
  [SupportedChainId.AVALANCHE]: { url: `https://avalanche-mainnet.infura.io/v3/${INFURA_KEY}`, usesInfura: true },
  [SupportedChainId.INK]: { url: `https://rpc-ten.inkonchain.com`, usesInfura: false },
  [SupportedChainId.LINEA]: { url: `https://rpc.linea.build`, usesInfura: false },
  [SupportedChainId.SEPOLIA]: { url: `https://sepolia.infura.io/v3/${INFURA_KEY}`, usesInfura: true },
}

/**
 * These are the network URLs used by the interface when there is not another available source of chain data
 */
export const RPC_URLS: Record<SupportedChainId, HttpsString> = mapSupportedNetworks(getRpcUrl)

function getRpcUrl(chainId: SupportedChainId): HttpsString {
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
