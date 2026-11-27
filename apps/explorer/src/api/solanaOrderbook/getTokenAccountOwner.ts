import { AddressKey } from '@cowprotocol/cow-sdk'

import { getParsedAccount } from './solanaRpc'

/**
 * The wallet behind an SPL token account. A Solana intent names the token account the bought amount
 * is paid into, and derivation only runs `(owner, mint) -> account`, so the owner cannot be computed
 * back from the address — it has to be read off the account itself.
 *
 * Resolves `null` when the account does not exist (never created, or closed again) or holds
 * something other than a token account. Rejects on a transport failure.
 */
export async function getTokenAccountOwner(tokenAccount: AddressKey): Promise<string | null> {
  const parsed = await getParsedAccount<{ owner?: string }>(tokenAccount)

  if (parsed?.type !== 'account') return null

  return parsed.info?.owner ?? null
}
