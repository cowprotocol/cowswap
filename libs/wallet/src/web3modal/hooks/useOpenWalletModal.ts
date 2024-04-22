import { useWeb3Modal } from '@web3modal/ethers5/react'
import { useCallback } from 'react'

export function useOpenWalletModal() {
  const { open: openWalletModal } = useWeb3Modal()

  return useCallback(() => {
    openWalletModal({ view: 'Connect' })
  }, [openWalletModal])
}
