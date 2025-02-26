import { useAtomValue } from 'jotai'

import { useWalletInfo as useReOwnWalletInfo } from '@reown/appkit/react'

import { useWalletCapabilities } from './hooks/useWalletCapabilities'
import { gnosisSafeInfoAtom, walletDetailsAtom, walletDisplayedAddress, walletInfoAtom } from './state'
import { GnosisSafeInfo, WalletDetails, WalletInfo } from './types'

import { METAMASK_RDNS, RABBY_RDNS, WATCH_ASSET_SUPPORED_WALLETS } from '../constants'
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

// TODO: if you want to test TWAP with others EIP-5792 wallets - keep only atomicBatch.supported
export function useIsTxBundlingSupported(): boolean | null {
  const { data: capabilities, isLoading: isCapabilitiesLoading } = useWalletCapabilities()
  const isSafeApp = useIsSafeApp()
  const isSafeViaWc = useIsSafeViaWc()

  if (isCapabilitiesLoading) return null

  return isSafeApp || (isSafeViaWc && !!capabilities?.atomicBatch?.supported)
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

// TODO: check if it works properly
export function useIsMetamaskBrowserExtensionWallet(): boolean {
  const { walletInfo } = useReOwnWalletInfo()

  return METAMASK_RDNS === walletInfo?.rdns
}
