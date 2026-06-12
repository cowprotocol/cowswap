import { TokenWithLogo } from '@cowprotocol/common-const'
import { isSupportedChainId } from '@cowprotocol/common-utils'
import { SupportedChainId, getAddressKey } from '@cowprotocol/cow-sdk'
import { fetchTokenFromBlockchain } from '@cowprotocol/tokens'
import type { TokensByAddress } from '@cowprotocol/tokens'
import { config as defaultWagmiConfig } from '@cowprotocol/wallet'

function getTokenKey(chainId: number, address: string): string {
  return `${chainId}::${getAddressKey(address)}`
}

let inFlightPromises: Partial<Record<string, Promise<TokenWithLogo>>> = {}

let cachedTokens: Record<string, TokenWithLogo> = {}

export function resetFetchTokensCache(): void {
  inFlightPromises = {}
  cachedTokens = {}
}

export async function fetchTokens(
  chainId: SupportedChainId,
  tokensByAddress: TokensByAddress,
  addresses: string[],
): Promise<null | TokensByAddress> {
  if (!isSupportedChainId(chainId)) return null

  const tokens: Record<string, TokenWithLogo> = {}
  const tokenPromises: Record<string, Promise<TokenWithLogo>> = {}

  addresses.forEach((address) => {
    const addressKey = getAddressKey(address)
    const tokenKey = getTokenKey(chainId, address)

    if (tokensByAddress[addressKey]) {
      tokens[addressKey] = tokensByAddress[addressKey]
    } else if (cachedTokens[tokenKey]) {
      tokens[addressKey] = cachedTokens[tokenKey]
    } else if (inFlightPromises[tokenKey]) {
      tokenPromises[addressKey] = inFlightPromises[tokenKey]
    } else if (!tokenPromises[addressKey]) {
      const promise = fetchTokenFromBlockchain(address, chainId, defaultWagmiConfig)
        .then((tokenData) => {
          const token = TokenWithLogo.fromToken(tokenData)
          cachedTokens[tokenKey] = token
          return token
        })
        .finally(() => {
          delete inFlightPromises[tokenKey]
        })

      tokenPromises[addressKey] = promise
      inFlightPromises[tokenKey] = promise
    }
  })

  const resolvedTokens = await Promise.all(Object.values(tokenPromises))

  resolvedTokens.forEach((token) => {
    const addressKey = getAddressKey(token.address)

    tokens[addressKey] = token
  })

  const hasAllTokens = addresses.every((address) => tokens[getAddressKey(address)])

  if (!hasAllTokens) throw new Error('Some tokens are missing but no error was thrown')

  return tokens
}
