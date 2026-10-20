import { useAppKit } from '@reown/appkit/react'

export function useOpenWalletConnectionModal(): () => void {
  const { open } = useAppKit()
  return open
}
