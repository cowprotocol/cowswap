import { isSolanaChain } from '@cowprotocol/cow-sdk'
import { useSolanaNativeBalance } from '@cowprotocol/wallet'

import ms from 'ms.macro'
import { useBalance, UseBalanceReturnType } from 'wagmi'

import type { Address } from 'viem'

const BALANCE_REFETCH_INTERVAL = ms`11s`

/**
 * Chain-agnostic native-balance hook. Detects the active network and delegates to the EVM
 * (wagmi) or Solana watcher; the other stays disabled. Both return a `UseBalanceReturnType`,
 * so consumers read `data.value` without knowing which chain is active.
 */
export function useNativeTokenBalance(account?: string, chainId?: number): UseBalanceReturnType {
  const isSolana = !!chainId && isSolanaChain(chainId)

  const evmBalance = useBalance({
    address: account as Address | undefined,
    chainId,
    query: {
      enabled: !!account && !isSolana,
      refetchInterval: BALANCE_REFETCH_INTERVAL,
    },
  })

  const solanaBalance = useSolanaNativeBalance({
    account,
    enabled: !!account && isSolana,
  })

  return isSolana ? solanaBalance : evmBalance
}
