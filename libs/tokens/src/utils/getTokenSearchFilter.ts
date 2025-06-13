import { isAddress } from '@cowprotocol/common-utils'
import { TokenInfo } from '@cowprotocol/types'
import { NativeCurrency, Token } from '@uniswap/sdk-core'

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const alwaysTrue = () => true

/** Creates a filter function that filters tokens that do not match the query. */
export function getTokenSearchFilter<T extends Token | TokenInfo>(
  query: string
): (token: T | NativeCurrency) => boolean {
  const searchingAddress = isAddress(query)

  if (searchingAddress) {
    const address = searchingAddress.toLowerCase()
    return (t: T | NativeCurrency) => 'address' in t && address === t.address.toLowerCase()
  }

  const queryParts = query
    .toLowerCase()
    .split(/\s+/)
    .filter((s) => s.length > 0)

  if (queryParts.length === 0) return alwaysTrue

  const match = (s: string): boolean => {
    const parts = s
      .toLowerCase()
      .split(/\s+/)
      .filter((s) => s.length > 0)

    return queryParts.every((p) => p.length === 0 || parts.some((sp) => sp.startsWith(p) || sp.endsWith(p)))
  }

  return ({ name, symbol }: T | NativeCurrency): boolean => {
    // Filter out from token names the bridge info to not pollute the results with garbage entries
    const filteredName = name?.replace(/\s*(on\s(gnosis|xdai)|from\s(mainnet|ethereum)).*$/i, '')

    return Boolean((symbol && match(symbol)) || (filteredName && match(filteredName)))
  }
}
