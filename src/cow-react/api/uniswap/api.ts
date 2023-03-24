import { FetchTokensApiResult } from './types'

const BASE_URL = 'https://temp.api.uniswap.org/v1/tokens/search?tokenQuery='

export async function getTokens(query: string): Promise<FetchTokensApiResult> {
  const response = await fetch(`${BASE_URL}${query}`)

  return await response.json()
}
