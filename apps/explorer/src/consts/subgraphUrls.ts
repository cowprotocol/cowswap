import { SUBGRAPH_PROD_CONFIG, SupportedChainId } from '@cowprotocol/cow-sdk'

function getSubgraphUrl(chainId: SupportedChainId, suffix: string): string | null {
  return process.env[`REACT_APP_SUBGRAPH_URL_${suffix}`] || SUBGRAPH_PROD_CONFIG[chainId] || null
}

/**
 * When value is null, then Subgraph is not supported for the network
 */
export const SUBGRAPH_URLS: Record<SupportedChainId, string | null> = {
  [SupportedChainId.MAINNET]: 'https://api.studio.thegraph.com/query/49707/cow-subgraph-mainnet/version/latest',
  [SupportedChainId.GNOSIS_CHAIN]: 'https://api.studio.thegraph.com/query/49707/cow-subgraph-gnosis/version/latest',
  [SupportedChainId.ARBITRUM_ONE]: 'https://api.studio.thegraph.com/query/49707/cow-subgraph-arb/version/latest',
  [SupportedChainId.SEPOLIA]: 'https://api.studio.thegraph.com/query/49707/cow-subgraph-sepolia/version/latest',
}
