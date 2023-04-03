import { GraphQLClient } from 'graphql-request'
import { SEARCH_TOKENS } from './queries'
import { FetchTokensApiResult } from './types'

const BASE_URL = 'https://cow-web-services.vercel.app/api/serverless/proxy'
const GQL_CLIENT = new GraphQLClient(BASE_URL)

export async function getTokens(searchQuery: string): Promise<FetchTokensApiResult> {
  return await GQL_CLIENT.request<FetchTokensApiResult>(SEARCH_TOKENS, {
    searchQuery,
  })
}
