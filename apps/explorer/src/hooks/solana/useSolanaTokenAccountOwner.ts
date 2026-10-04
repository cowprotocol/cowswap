import { AddressKey } from '@cowprotocol/cow-sdk'

import useSWR from 'swr'

import { getTokenAccountOwner } from '../../api/solanaOrderbook/getTokenAccountOwner'
import { isAssociatedTokenAccountOf } from '../../utils/solana/isAssociatedTokenAccountOf'

export interface SolanaTokenAccountOwner {
  owner: string | undefined
  isLoading: boolean
}

export interface SolanaTokenAccountOwnerParams {
  tokenAccount: AddressKey | undefined
  /** The order's owner, whose own associated token account the receiver is unless it was customised. */
  orderOwner: AddressKey | undefined
  buyMint: AddressKey | undefined
}

/**
 * `owner` stays undefined while loading, and for a receiver that resolves to neither a readable
 * account nor the order owner's own — callers have nothing better than the token account address
 * itself to show in that case.
 */
export function useSolanaTokenAccountOwner({
  tokenAccount,
  orderOwner,
  buyMint,
}: SolanaTokenAccountOwnerParams): SolanaTokenAccountOwner {
  const { data, isLoading } = useSWR(
    tokenAccount ? (['solana-token-account-owner', tokenAccount, orderOwner, buyMint] as const) : null,
    ([, account, owner, mint]) => resolveOwner(account, owner, mint),
    { onError: () => undefined },
  )

  return { owner: data ?? undefined, isLoading }
}

async function resolveOwner(
  tokenAccount: AddressKey,
  orderOwner: AddressKey | undefined,
  buyMint: AddressKey | undefined,
): Promise<string | null> {
  const owner = await getTokenAccountOwner(tokenAccount)

  if (owner) return owner

  // Reached only once the read came back empty, never on a failed one — it throws, and SWR records
  // that as an error instead. An account that exists may have been transferred away from the owner
  // it was derived for, and only a completed read rules that out.
  if (!orderOwner || !buyMint) return null

  return (await isAssociatedTokenAccountOf(tokenAccount, orderOwner, buyMint)) ? orderOwner : null
}
