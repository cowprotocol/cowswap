import type { Address } from 'viem'
import { useBalance, UseBalanceReturnType } from 'wagmi'

import ms from 'ms.macro'

export function useNativeTokenBalance(account?: string, chainId?: number): UseBalanceReturnType {
  return useBalance({
    address: account as Address | undefined,
    chainId,
    query: {
      enabled: !!account,
      refetchInterval: ms`11s`,
    },
  })
}
