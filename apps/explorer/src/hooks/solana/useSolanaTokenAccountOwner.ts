import { AddressKey } from '@cowprotocol/cow-sdk'

import useSWR from 'swr'

import { getTokenAccountOwner } from '../../api/solanaOrderbook/getTokenAccountOwner'

export interface SolanaTokenAccountOwner {
  owner: string | undefined
  isLoading: boolean
}

/**
 * `owner` stays undefined while loading, and for an account the chain cannot resolve one for —
 * callers have nothing better than the token account address itself to show in that case.
 */
export function useSolanaTokenAccountOwner(tokenAccount: AddressKey | undefined): SolanaTokenAccountOwner {
  const { data, isLoading } = useSWR(
    tokenAccount ? `solana-token-account-owner:${tokenAccount}` : null,
    () => {
      if (!tokenAccount) throw new Error('missing tokenAccount')

      return getTokenAccountOwner(tokenAccount)
    },
    { onError: () => undefined },
  )

  return { owner: data ?? undefined, isLoading }
}
