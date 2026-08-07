import { useAtomValue } from 'jotai'
import { useMemo } from 'react'

import { allowancesAtom } from '@cowprotocol/balances-and-allowances'
import { getAddressKey, isSolanaChain } from '@cowprotocol/cow-sdk'
import { useWalletInfo } from '@cowprotocol/wallet'

/**
 * Solana has no ERC-20 `allowance` call, so the approve gating (`useApproveState`, `useNeedsApproval`)
 * reads the SPL delegation persisted into `allowancesAtom` here instead. Returns `undefined` on
 * non-Solana chains so the EVM allowance path is used unchanged.
 */
export function useSolanaDelegationAllowance(tokenAddress: string | undefined): bigint | undefined {
  const { chainId } = useWalletInfo()
  const persistedAllowancesByChain = useAtomValue(allowancesAtom)

  return useMemo(() => {
    if (!isSolanaChain(chainId) || !tokenAddress) return undefined

    return persistedAllowancesByChain[chainId]?.[getAddressKey(tokenAddress)] ?? 0n
  }, [persistedAllowancesByChain, chainId, tokenAddress])
}
