import { BFF_BASE_URL } from '@cowprotocol/common-const'
import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { gql, GraphQLClient } from 'graphql-request'

type Address = `0x${string}`

type Chain =
  | 'ARBITRUM'
  | 'ETHEREUM'
  | 'ETHEREUM_SEPOLIA'
  | 'OPTIMISM'
  | 'POLYGON'
  | 'AVALANCHE'
  | 'CELO'
  | 'BNB'
  | 'BASE'
  | 'UNKNOWN_CHAIN'

interface FetchTokensResult {
  id: string
  decimals: number
  name: string
  chain: Chain
  standard: string
  address: Address
  symbol: string
  project: {
    id: string
    name: string
    logoUrl: string
    logo: {
      id: string
      url: string
    }
    safetyLevel: string
  }
}

interface FetchTokensApiResult {
  searchTokens: FetchTokensResult[]
}

export interface TokenSearchFromApiResult extends FetchTokensResult {
  chainId: SupportedChainId
}

const SEARCH_TOKENS = gql`
  query SearchTokensWeb($searchQuery: String!, $chains: [Chain!]) {
    searchTokens(searchQuery: $searchQuery, chains: $chains) {
      ...SimpleTokenDetails
      id
      decimals
      name
      chain
      standard
      address
      symbol
      market(currency: USD) {
        id
        price {
          id
          value
          currency
          __typename
        }
        pricePercentChange(duration: DAY) {
          id
          value
          __typename
        }
        volume24H: volume(duration: DAY) {
          id
          value
          currency
          __typename
        }
        __typename
      }
      project {
        id
        name
        logo {
          id
          url
          __typename
        }
        safetyLevel
        logoUrl
        isSpam
        __typename
      }
      __typename
    }
  }

  fragment SimpleTokenDetails on Token {
    id
    address
    chain
    symbol
    name
    decimals
    standard
    project {
      id
      name
      logo {
        id
        url
        __typename
      }
      safetyLevel
      logoUrl
      isSpam
      __typename
    }
    __typename
  }
`

const BASE_URL = `${BFF_BASE_URL}/proxies/tokens`
const GQL_CLIENT = new GraphQLClient(BASE_URL)

const CHAIN_NAMES: Record<SupportedChainId, Chain | null> = {
  [SupportedChainId.MAINNET]: 'ETHEREUM',
  [SupportedChainId.ARBITRUM_ONE]: 'ARBITRUM',
  [SupportedChainId.BASE]: 'BASE',
  [SupportedChainId.SEPOLIA]: 'ETHEREUM_SEPOLIA',
  [SupportedChainId.GNOSIS_CHAIN]: null,
  [SupportedChainId.POLYGON]: 'POLYGON',
  [SupportedChainId.AVALANCHE]: 'AVALANCHE',
}

const CHAIN_IDS = Object.entries(CHAIN_NAMES).reduce(
  (acc, [supportedChainId, chain]) => {
    if (chain) {
      acc[chain] = parseInt(supportedChainId)
    }

    return acc
  },
  {} as Record<Chain, SupportedChainId>,
)

export async function searchTokensInApi(
  chainId: SupportedChainId,
  searchQuery: string,
): Promise<TokenSearchFromApiResult[]> {
  const chain = CHAIN_NAMES[chainId]

  if (!chain) {
    return []
  }

  return await GQL_CLIENT.request<FetchTokensApiResult>(SEARCH_TOKENS, {
    searchQuery,
    chains: [chain],
  }).then((result) => {
    if (!result?.searchTokens?.length) {
      return []
    }

    return result.searchTokens.map((token) => {
      return {
        ...token,
        chainId: CHAIN_IDS[token.chain],
      }
    })
  })
}
