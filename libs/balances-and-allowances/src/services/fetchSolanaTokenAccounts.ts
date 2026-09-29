import { Connection, PublicKey } from '@solana/web3.js'

import { readSolanaTokenAccounts, SolanaTokenMint } from './readSolanaTokenAccounts'

export type { SolanaTokenMint } from './readSolanaTokenAccounts'

export interface SolanaTokenAccountData {
  mint: string
  balance: bigint
  // SPL-approved amount when the account's delegate is the CoW settlement authority, else `undefined`
  // (no CoW approval).
  delegatedAmount: bigint | undefined
}

/**
 * Reads the SPL balance AND delegation for `tokens` owned by `ownerAddress` in a single batched request.
 * Both live on the same token account, so there is no separate delegate query — the delegation rides
 * along with the balance for free.
 *
 * `delegatedAmount` is set only when the account's `delegate` equals `delegateAuthority` (the settlement
 * state PDA). A missing account means the owner never held that token: zero balance, no delegation.
 * Results stay aligned to `tokens` order.
 */
export async function fetchSolanaTokenAccounts(
  connection: Connection,
  ownerAddress: string,
  tokens: SolanaTokenMint[],
  delegateAuthority: PublicKey,
): Promise<SolanaTokenAccountData[]> {
  const accounts = await readSolanaTokenAccounts(connection, ownerAddress, tokens)

  return tokens.map(({ mint }, index) => {
    const account = accounts[index]
    const isCowDelegate = account?.delegate?.equals(delegateAuthority) ?? false

    return {
      mint,
      balance: account?.amount ?? 0n,
      delegatedAmount: isCowDelegate ? account?.delegatedAmount : undefined,
    }
  })
}
