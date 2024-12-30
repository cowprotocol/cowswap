import { useAtomValue } from 'jotai'

import { useWalletInfo as useReOwnWalletInfo } from '@reown/appkit/react'

import { useWalletCapabilities } from './hooks/useWalletCapabilities'
import { gnosisSafeInfoAtom, walletDetailsAtom, walletDisplayedAddress, walletInfoAtom } from './state'
import { GnosisSafeInfo, WalletDetails, WalletInfo } from './types'

import { RABBY_RDNS, WATCH_ASSET_SUPPORED_WALLETS } from '../constants'
import { useIsSafeApp } from '../reown/hooks/useWalletMetadata'

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
  const capabilities = useWalletCapabilities()

  // For now, bundling can only be performed while the App is loaded as a Safe App
  // Pending a custom RPC endpoint implementation on Safe side to allow
  // tx bundling via WalletConnect
  return useIsSafeApp() || !!capabilities?.atomicBatch?.supported
}

export function useIsAssetWatchingSupported(): boolean {
  const { walletInfo } = useReOwnWalletInfo()

  if (!walletInfo?.rdns) return false

  return WATCH_ASSET_SUPPORED_WALLETS.includes(walletInfo.rdns as string)
}

export function useIsRabbyWallet(): boolean {
  const { walletInfo } = useReOwnWalletInfo()

  return walletInfo?.rdns === RABBY_RDNS
}
