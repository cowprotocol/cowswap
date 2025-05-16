import { SupportedChainId, TargetChainId } from '@cowprotocol/cow-sdk'
import { DEFAULT_TOKENS_LISTS, fetchTokenList } from '@cowprotocol/tokens'
import type { TokenInfo } from '@uniswap/token-lists'

const tokensCache = new Map<TargetChainId, Record<string, TokenInfo>>()

/**
 * TODO: refactor this and make it more efficient
 * Add parallel request handling
 */
export async function getErc20Tokens(chainId: TargetChainId, addresses: string[]): Promise<TokenInfo[]> {
  const lists = DEFAULT_TOKENS_LISTS[chainId as SupportedChainId]

  if (!lists) {
    return []
  }

  const cached = tokensCache.get(chainId)

  if (cached) {
    return getTokensFromLists(addresses, cached)
  }

  const allLists = await Promise.all(lists.map((list) => fetchTokenList(list)))
  const tokens = allLists.flatMap((list) => list.list.tokens)
  const tokensByAddress = Object.fromEntries(
    tokens.filter((token) => token.chainId === chainId).map((token) => [token.address.toLowerCase(), token]),
  )

  tokensCache.set(chainId, tokensByAddress)

  return getTokensFromLists(addresses, tokensByAddress)
}

function getTokensFromLists(addresses: string[], list: Record<string, TokenInfo>): TokenInfo[] {
  return addresses.reduce((acc, address) => {
    const token = list[address.toLowerCase()]
    if (token) {
      acc.push(token)
    }
    return acc
  }, [] as TokenInfo[])
}
