import { useAtomValue } from 'jotai'

import { gnosisSafeInfoAtom, walletDetailsAtom, walletDisplayedAddress, walletInfoAtom } from './state'
import { GnosisSafeInfo, WalletDetails, WalletInfo } from './types'

import { useIsSafeApp } from '../web3-react/hooks/useWalletMetadata'
import { useWeb3Modal } from '@web3modal/ethers5/react'
import { useCallback } from 'react'

export function useWalletInfo(): WalletInfo {
  return useAtomValue(walletInfoAtom)
}

export function useWalletDetails(): WalletDetails {
  return useAtomValue(walletDetailsAtom)
}

export function useWalletDisplayedAddress(): string {
  return useAtomValue(walletDisplayedAddress)
}

export function useGnosisSafeInfo(): GnosisSafeInfo | undefined {
  return useAtomValue(gnosisSafeInfoAtom)
}

export function useIsBundlingSupported(): boolean {
  // For now, bundling can only be performed while the App is loaded as a Safe App
  // Pending a custom RPC endpoint implementation on Safe side to allow
  // tx bundling via WalletConnect
  return useIsSafeApp()
}

export function useOpenWalletModal() {
  const { open: openWalletModal } = useWeb3Modal()

  return useCallback(() => {
    openWalletModal({ view: 'Connect' })
  }, [openWalletModal])
}
