import { SupportedChainId, TargetChainId } from '@cowprotocol/cow-sdk'
import { DEFAULT_TOKENS_LISTS, fetchTokenList } from '@cowprotocol/tokens'
import type { TokenInfo } from '@uniswap/token-lists'

const tokensCache = new Map<TargetChainId, Record<string, TokenInfo>>()

export async function getErc20Token(chainId: TargetChainId, tokenAddress: string): Promise<TokenInfo | null> {
  const lists = DEFAULT_TOKENS_LISTS[chainId as SupportedChainId]

  if (!lists) {
    return null
  }

  const cached = tokensCache.get(chainId)

  if (cached) {
    return cached[tokenAddress.toLowerCase()]
  }

  const allLists = await Promise.all(lists.map((list) => fetchTokenList(list)))
  const tokens = allLists.flatMap((list) => list.list.tokens)
  const tokensByAddress = Object.fromEntries(tokens.map((token) => [token.address.toLowerCase(), token]))

  tokensCache.set(chainId, tokensByAddress)

  return tokensByAddress[tokenAddress.toLowerCase()]
}
