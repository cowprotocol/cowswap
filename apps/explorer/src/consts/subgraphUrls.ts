import { SUBGRAPH_PROD_CONFIG, SupportedChainId } from '@cowprotocol/cow-sdk'

function getSubgraphUrl(chainId: SupportedChainId, suffix: string): string | null {
  return process.env[`REACT_APP_SUBGRAPH_URL_${suffix}`] || SUBGRAPH_PROD_CONFIG[chainId] || null
}

/**
 * When value is null, then Subgraph is not supported for the network
 */
export const SUBGRAPH_URLS: Record<SupportedChainId, string | null> = {
  [SupportedChainId.MAINNET]:
    'https://subgraph.satsuma-prod.com/a29a417e85ec/cow-nomev-labs-pt516811924/cow-subgraph-mainnet/api',
  [SupportedChainId.GNOSIS_CHAIN]:
    'https://subgraph.satsuma-prod.com/a29a417e85ec/cow-nomev-labs-pt516811924/cow-subgraphs-gnosis/api',
  [SupportedChainId.ARBITRUM_ONE]:
    'https://subgraph.satsuma-prod.com/a29a417e85ec/cow-nomev-labs-pt516811924/cow-subgraph-arb/api',
  [SupportedChainId.BASE]: getSubgraphUrl(SupportedChainId.BASE, 'BASE'),
  [SupportedChainId.SEPOLIA]:
    'https://subgraph.satsuma-prod.com/a29a417e85ec/cow-nomev-labs-pt516811924/cow-subgraph-sepolia/api',
}
