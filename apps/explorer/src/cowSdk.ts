import { OrderBookApi, SupportedChainId } from '@cowprotocol/cow-sdk'
import { SubgraphApi } from '@cowprotocol/cow-sdk'
import { MetadataApi } from '@cowprotocol/app-data'
import { SUBGRAPH_PROD_CONFIG } from '@cowprotocol/cow-sdk'

function getSubgraphUrls(): Record<SupportedChainId, string> {
  const [mainnetUrl, gcUrl, goerliUrl] = [
    process.env.REACT_APP_SUBGRAPH_URL_MAINNET || undefined,
    process.env.REACT_APP_SUBGRAPH_URL_GNOSIS_CHAIN || undefined,
    process.env.REACT_APP_SUBGRAPH_URL_GOERLI || undefined,
  ]

  return {
    ...SUBGRAPH_PROD_CONFIG,
    ...(mainnetUrl ? { [SupportedChainId.MAINNET]: mainnetUrl } : undefined),
    ...(gcUrl ? { [SupportedChainId.GNOSIS_CHAIN]: gcUrl } : undefined),
    ...(goerliUrl ? { [SupportedChainId.GOERLI]: goerliUrl } : undefined),
  }
}

export const orderBookSDK = new OrderBookApi({ env: 'prod' })
export const subgraphApiSDK = new SubgraphApi({ baseUrls: getSubgraphUrls() })
export const metadataApiSDK = new MetadataApi()
