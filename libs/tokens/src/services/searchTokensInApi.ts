import { BFF_BASE_URL } from '@cowprotocol/common-const'
import { fetchWithTimeout, JSON_HEADERS, parseJsonResponse, unwrapOk } from '@cowprotocol/common-utils'
import { SupportedChainId } from '@cowprotocol/cow-sdk'

export interface TokenSearchFromApiResult {
  chainId: SupportedChainId
  address: string
  decimals: number
  name: string
  symbol: string
  logoURI?: string
}

const SEARCH_CHAINS: readonly SupportedChainId[] = [
  SupportedChainId.MAINNET,
  SupportedChainId.ARBITRUM_ONE,
  SupportedChainId.BASE,
  SupportedChainId.SEPOLIA,
  SupportedChainId.POLYGON,
  SupportedChainId.AVALANCHE,
  SupportedChainId.BNB,
]

export async function searchTokensInApi(
  chainId: SupportedChainId,
  searchQuery: string,
): Promise<TokenSearchFromApiResult[]> {
  if (!SEARCH_CHAINS.includes(chainId)) return []

  const response = await fetchWithTimeout(`${BFF_BASE_URL}/proxies/token-search`, {
    method: 'POST',
    headers: JSON_HEADERS,
    body: JSON.stringify({ chainId, searchQuery }),
  })
  return unwrapOk(
    await parseJsonResponse<TokenSearchFromApiResult[]>(response),
    'Token search failed. Try again later.',
  )
}
