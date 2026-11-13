import { BFF_BASE_URL } from '@cowprotocol/common-const'
import { fetchWithTimeout } from '@cowprotocol/common-utils'

export type TokenRestriction = { restricted: true; tokenList: string } | { restricted: false }

const TOKEN_RESTRICTION_TIMEOUT_MS = 10_000

export async function fetchTokenRestriction(
  chainId: number,
  tokenAddress: string,
  countryCode: string,
): Promise<TokenRestriction> {
  const query = new URLSearchParams({ countryCode })
  const response = await fetchWithTimeout(
    `${BFF_BASE_URL}/get-token-restrictions/${chainId}/${tokenAddress}?${query}`,
    {
      headers: { Accept: 'application/json' },
      timeout: TOKEN_RESTRICTION_TIMEOUT_MS,
      timeoutMessage: 'Token restrictions request timed out',
    },
  )

  if (!response.ok) {
    throw new Error(`Token restrictions request failed with status ${response.status}`)
  }

  const body: unknown = await response.json()

  if (!isTokenRestriction(body)) {
    throw new Error('Token restrictions response has an unexpected shape')
  }

  return body
}

function isTokenRestriction(body: unknown): body is TokenRestriction {
  if (typeof body !== 'object' || body === null || !('restricted' in body)) return false

  if (body.restricted === false) return true

  return body.restricted === true && 'tokenList' in body && typeof body.tokenList === 'string'
}
