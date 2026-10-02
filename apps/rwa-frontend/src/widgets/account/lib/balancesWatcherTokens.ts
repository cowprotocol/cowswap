import type { RwaTokenList } from '@/entities/asset'
import type { BalancesWatcherTokens } from '@/shared/api'

/** The token list must be hosted where the balances watcher accepts it, `files.cow.fi` or GitHub */
const HOSTED_TOKEN_LIST_URL = process.env.NEXT_PUBLIC_RWA_TOKEN_LIST_URL

export function getBalancesWatcherTokens(tokenList: RwaTokenList, chainId: number): BalancesWatcherTokens {
  if (HOSTED_TOKEN_LIST_URL) return { tokensListsUrls: [HOSTED_TOKEN_LIST_URL], customTokens: [] }

  return {
    tokensListsUrls: [],
    customTokens: tokenList.tokens.filter((token) => token.chainId === chainId).map((token) => token.address),
  }
}
