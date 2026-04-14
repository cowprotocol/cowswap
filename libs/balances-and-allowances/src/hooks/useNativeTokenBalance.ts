import ms from 'ms.macro'
import { useBalance, UseBalanceReturnType } from 'wagmi'

import type { Address } from 'viem'

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
