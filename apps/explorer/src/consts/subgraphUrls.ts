import { SUBGRAPH_PROD_CONFIG, SupportedChainId } from '@cowprotocol/cow-sdk'

function getSubgraphUrl(chainId: SupportedChainId, suffix: string): string | null {
  return process.env[`REACT_APP_SUBGRAPH_URL_${suffix}`] || SUBGRAPH_PROD_CONFIG[chainId] || null
}

/**
 * When value is null, then Subgraph is not supported for the network
 */
export const SUBGRAPH_URLS: Record<SupportedChainId, string | null> = {
  [SupportedChainId.MAINNET]: getSubgraphUrl(SupportedChainId.MAINNET, 'MAINNET'),
  [SupportedChainId.GNOSIS_CHAIN]: getSubgraphUrl(SupportedChainId.GNOSIS_CHAIN, 'GNOSIS_CHAIN'),
  [SupportedChainId.SEPOLIA]: getSubgraphUrl(SupportedChainId.SEPOLIA, 'SEPOLIA'),
}
