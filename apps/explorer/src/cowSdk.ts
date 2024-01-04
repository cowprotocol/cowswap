import { OrderBookApi, SupportedChainId } from '@cowprotocol/cow-sdk'
import { SubgraphApi } from '@cowprotocol/cow-sdk'
import { MetadataApi } from '@cowprotocol/app-data'
import { SUBGRAPH_PROD_CONFIG } from '@cowprotocol/cow-sdk'

function getSubgraphUrls(): Record<SupportedChainId, string> {
  const [mainnetUrl, gcUrl, goerliUrl, sepoliaUrl] = [
    process.env.REACT_APP_SUBGRAPH_URL_MAINNET || undefined,
    process.env.REACT_APP_SUBGRAPH_URL_GNOSIS_CHAIN || undefined,
    process.env.REACT_APP_SUBGRAPH_URL_GOERLI || undefined,
    process.env.REACT_APP_SUBGRAPH_URL_SEPOLIA || undefined,
  ]

  return {
    ...SUBGRAPH_PROD_CONFIG,
    ...{ [SupportedChainId.SEPOLIA]: 'https://api.thegraph.com/subgraphs/name/cowprotocol/sepolia' },
    ...(mainnetUrl ? { [SupportedChainId.MAINNET]: mainnetUrl } : undefined),
    ...(gcUrl ? { [SupportedChainId.GNOSIS_CHAIN]: gcUrl } : undefined),
    ...(goerliUrl ? { [SupportedChainId.GOERLI]: goerliUrl } : undefined),
    ...(sepoliaUrl ? { [SupportedChainId.SEPOLIA]: sepoliaUrl } : undefined),
  }
}

export const orderBookSDK = new OrderBookApi({ env: 'staging' })
export const subgraphApiSDK = new SubgraphApi({ baseUrls: getSubgraphUrls() })
export const metadataApiSDK = new MetadataApi()
