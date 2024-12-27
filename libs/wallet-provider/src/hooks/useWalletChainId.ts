import { useAppKitNetwork } from '@reown/appkit/react'

export function useWalletChainId(): number | undefined {
  const { chainId } = useAppKitNetwork()

  return chainId ? +chainId : undefined
}
