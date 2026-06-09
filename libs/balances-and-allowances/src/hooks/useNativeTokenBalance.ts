import { isSolanaChain } from '@cowprotocol/cow-sdk'

import ms from 'ms.macro'
import { useBalance, UseBalanceReturnType } from 'wagmi'

import type { Address } from 'viem'

export function useNativeTokenBalance(account?: string, chainId?: number): UseBalanceReturnType {
  const isSolana = !!chainId && isSolanaChain(chainId)

  return useBalance({
    address: account as Address | undefined,
    chainId,
    query: {
      // TODO solana add support
      enabled: !!account && !isSolana,
      refetchInterval: ms`11s`,
    },
  })
}
