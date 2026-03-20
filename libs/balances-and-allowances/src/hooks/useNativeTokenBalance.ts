import { useBalance, UseBalanceReturnType } from 'wagmi'

import type { Address } from 'viem'

export function useNativeTokenBalance(account?: string): UseBalanceReturnType {
  return useBalance({ address: account as Address | undefined, query: { enabled: !!account } })
}
