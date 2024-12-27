import { useWalletInfo } from '@reown/appkit/react'

import { useSafeAppsSdk } from './useSafeAppsSdk'

import { useGnosisSafeInfo } from '../../api/hooks'

export interface WalletMetaData {
  walletName?: string
  icon?: string
}

export function useWalletMetaData(): WalletMetaData {
  const { walletInfo } = useWalletInfo()

  return {
    walletName: walletInfo?.name,
    icon: walletInfo?.icon,
  }
}

/**
 * Detects whether the currently connected wallet is a Safe App
 * It'll be false if connected to Safe wallet via WalletConnect
 */
export function useIsSafeApp(): boolean {
  const isSafeWallet = useIsSafeWallet()
  const sdk = useSafeAppsSdk()

  // If the wallet is not a Safe, or we don't have access to the SafeAppsSDK, we know is not a Safe App
  if (!isSafeWallet || !sdk) {
    return false
  }

  // Will only be a SafeApp if within an iframe
  // Which means, window.parent is different than window
  return window?.parent !== window
}

/**
 * Detects whether the currently connected wallet is a Safe wallet
 * regardless of the connection method (WalletConnect or inside Safe as an App)
 */
export function useIsSafeWallet(): boolean {
  return !!useGnosisSafeInfo()
}

/**
 * Detects whether the currently connected wallet is a Safe wallet
 * but NOT loaded as a Safe App
 */
export function useIsSafeViaWc(): boolean {
  const isSafeApp = useIsSafeApp()
  const isSafeWallet = useIsSafeWallet()

  return isSafeWallet && !isSafeApp
}
