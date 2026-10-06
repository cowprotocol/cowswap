import { AddressKey } from '@cowprotocol/cow-sdk'

import { TokenErc20 } from '@gnosis.pm/dex-js'

import { getParsedAccount } from './solanaRpc'

/**
 * Decimals for mints the Solana token list does not carry, read off the mint account itself.
 * Without them an order's amounts cannot be formatted at all. Name and symbol live in Metaplex
 * metadata rather than the mint, so they stand in as a shortened mint.
 */

/**
 * Resolves a mint, or `null` when the chain has nothing usable for it.
 *
 * Rejects rather than returning `null` on a transport failure, so the caller can tell "no such mint"
 * from "the request did not get through" and retry only the latter.
 */
export async function getSplTokenInfo(mint: AddressKey): Promise<TokenErc20 | null> {
  const parsed = await getParsedAccount<{ decimals?: number }>(mint)
  const decimals = parsed?.info?.decimals

  // Not a mint account, or an endpoint that parsed it into something unexpected.
  if (typeof decimals !== 'number') return null

  const shortened = `${mint.slice(0, 4)}…${mint.slice(-4)}`

  return { address: mint, decimals, symbol: shortened, name: shortened }
}
