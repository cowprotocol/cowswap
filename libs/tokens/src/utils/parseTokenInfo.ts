import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { TokenInfo } from '@cowprotocol/types'
import type { TokenInfo as Erc20TokenInfo } from '@uniswap/token-lists'

interface BridgeInfo {
  [chainId: number]: {
    tokenAddress: string
  }
}

export function parseTokenInfo(chainId: SupportedChainId, token: Erc20TokenInfo): TokenInfo | null {
  const bridgeInfo = token.extensions?.['bridgeInfo'] as never as BridgeInfo | undefined
  const currentChainInfo = bridgeInfo?.[chainId]
  const bridgeAddress = currentChainInfo?.tokenAddress

  if (token.chainId !== chainId && !bridgeAddress) return null

  const tokenAddress = bridgeAddress || token.address
  const lpTokens = token.extensions?.['tokens'] as string | undefined

  return {
    ...token,
    address: tokenAddress,
    ...(lpTokens ? { tokens: lpTokens.split(',').map((t) => t.toLowerCase()) } : undefined),
  }
}
