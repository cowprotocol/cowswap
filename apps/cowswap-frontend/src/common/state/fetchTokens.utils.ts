import { TokenWithLogo, getRpcProvider } from '@cowprotocol/common-const'
import { isSupportedChainId } from '@cowprotocol/common-utils'
import { SupportedChainId, getAddressKey } from '@cowprotocol/cow-sdk'
import { fetchTokenFromBlockchain } from '@cowprotocol/tokens'
import type { TokensByAddress } from '@cowprotocol/tokens'

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
  const provider = getRpcProvider(chainId)

  if (!provider || !isSupportedChainId(chainId)) return null

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
      // TODO M-6 COW-573
      // This flow will be reviewed and updated later, to include a wagmi alternative

      const promise = fetchTokenFromBlockchain(address, chainId, provider)
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
