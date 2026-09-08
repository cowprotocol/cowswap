import { TokenWithLogo } from '@cowprotocol/common-const'
import { areAddressesEqual, getAddressKey } from '@cowprotocol/cow-sdk'

import { TokensByAddress, TokensBySymbol } from '../state/tokens/allTokensAtom'

/**
 * Whether `symbol` resolves back to the token at `address`.
 *
 * `useTokenBySymbolOrAddress` resolves a symbol through `tokensBySymbolAtom`, which only holds active
 * tokens and returns the first match. A token is therefore unreachable by symbol when it is not active
 * yet, or when its address is active under a *different* symbol - the Coinbase RWA list ships `AAPL` at
 * an address the CoinGecko list already ships as `AAPLC`. Referring to such a token by symbol produces
 * a reference that stops resolving as soon as the user-added copy is pruned, which re-triggers the
 * import prompt in a loop.
 */
export function doesSymbolResolveToAddress(
  tokensBySymbol: TokensBySymbol,
  symbol: string | null | undefined,
  address: string | null | undefined,
): boolean {
  if (!symbol || !address) return false

  const resolved = tokensBySymbol[symbol.toLowerCase()]?.[0]

  if (!resolved) return false

  return areAddressesEqual(resolved.address, address)
}

/**
 * Drops tokens whose address is already among the active tokens.
 *
 * Used for the importable search buckets (inactive lists, external API, blockchain): an address that is
 * already active needs no import, and offering one shows the same contract twice - once as a tradable
 * token and once behind an "Import" button.
 */
export function excludeAlreadyActiveTokens(tokens: TokenWithLogo[], tokensByAddress: TokensByAddress): TokenWithLogo[] {
  if (!tokens.length) return tokens

  return tokens.filter((token) => !tokensByAddress[getAddressKey(token.address)])
}
