import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { gql, GraphQLClient } from 'graphql-request'

type Address = `0x${string}`

type Chain = 'ARBITRUM' | 'ETHEREUM' | 'ETHEREUM_SEPOLIA' | 'OPTIMISM' | 'POLYGON' | 'CELO' | 'BNB' | 'UNKNOWN_CHAIN'

const CHAIN_TO_CHAIN_ID: { [key: string]: SupportedChainId } = {
  ETHEREUM: SupportedChainId.MAINNET,
  ETHEREUM_SEPOLIA: SupportedChainId.SEPOLIA,
}

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
    logoUrl: string
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
  query SearchTokens($searchQuery: String!) {
    searchTokens(searchQuery: $searchQuery) {
      id
      decimals
      name
      chain
      standard
      address
      symbol
      project {
        id
        logoUrl
        safetyLevel
        __typename
      }
      __typename
    }
  }
`

const BASE_URL = 'https://cow-web-services.vercel.app/api/serverless/proxy'
const GQL_CLIENT = new GraphQLClient(BASE_URL)

export async function searchTokensInApi(searchQuery: string): Promise<TokenSearchFromApiResult[]> {
  return await GQL_CLIENT.request<FetchTokensApiResult>(SEARCH_TOKENS, {
    searchQuery,
  }).then((result) => {
    if (!result?.searchTokens?.length) {
      return []
    }

    return result.searchTokens.map((token) => ({ ...token, chainId: CHAIN_TO_CHAIN_ID[token.chain] }))
  })
}
