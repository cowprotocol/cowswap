import { useBalance, UseBalanceReturnType } from 'wagmi'

export function useNativeTokenBalance(account?: string): UseBalanceReturnType {
  return useBalance({ address: account, query: { enabled: !!account } })
}
