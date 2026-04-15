import { useChainId } from 'wagmi'

export function useWalletChainId(): number | undefined {
  return useChainId()
}
