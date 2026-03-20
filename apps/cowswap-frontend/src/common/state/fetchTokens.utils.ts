import { TokenWithLogo, getRpcProvider } from '@cowprotocol/common-const'
import { isSupportedChainId } from '@cowprotocol/common-utils'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { fetchTokenFromBlockchain } from '@cowprotocol/tokens'
import type { TokensByAddress } from '@cowprotocol/tokens'

function getTokenKey(chainId: number, address: string): string {
  return `${chainId}::${address.toLowerCase()}`
}

const cachedTokens: Record<string, TokenWithLogo> = {}

export async function fetchTokens(
  chainId: SupportedChainId,
  tokensByAddress: TokensByAddress,
  addresses: string[],
): Promise<null | TokensByAddress> {
  const provider = getRpcProvider(chainId)

  if (!provider || !isSupportedChainId(chainId)) return null

  const tokens: Record<string, TokenWithLogo> = {}
  const tokenPromises: Promise<TokenWithLogo>[] = []

  addresses.forEach((address) => {
    const addressKey = address.toLowerCase()
    const tokenKey = getTokenKey(chainId, address)

    if (cachedTokens[tokenKey]) {
      tokens[addressKey] = cachedTokens[tokenKey]
    } else if (tokensByAddress[addressKey]) {
      tokens[addressKey] = tokensByAddress[addressKey]
    } else {
      // TODO M-6 COW-573
      // This flow will be reviewed and updated later, to include a wagmi alternative

      tokenPromises.push(fetchTokenFromBlockchain(address, chainId, provider).then(TokenWithLogo.fromToken))
    }
  })

  const resolvedTokens = await Promise.all(tokenPromises)

  resolvedTokens.forEach((token) => {
    const addressKey = token.address.toLowerCase()
    const tokenKey = getTokenKey(chainId, token.address)

    tokens[addressKey] = token
    cachedTokens[tokenKey] = token
  })

  return tokens
}
