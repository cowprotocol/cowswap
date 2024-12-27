import { useAppKit } from '@reown/appkit/react'

export function useOpenWalletConnectionModal() {
  const { open } = useAppKit()

  return open
}
