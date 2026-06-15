import { useAtomValue } from 'jotai'

import { useConnection } from 'wagmi'

import {
  gnosisSafeInfoAtom,
  walletDetailsAtom,
  walletDisplayedAddress,
  walletInfoAtom,
  isEagerConnectInProgressAtom,
} from './state'
import { isBundlingSupportedAtom } from './state/walletCapabilitiesAtom'
import { ConnectionType, GnosisSafeInfo, WalletDetails, WalletInfo } from './types'

import { BRAVE_WALLET_RDNS, METAMASK_RDNS, RABBY_RDNS, WATCH_ASSET_SUPPORED_WALLETS } from '../constants'

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

export function useIsEagerConnectInProgress(): boolean {
  return useAtomValue(isEagerConnectInProgressAtom)
}

export function useIsTxBundlingSupported(): boolean | null {
  return useAtomValue(isBundlingSupportedAtom)
}

export function useIsAssetWatchingSupported(): boolean {
  const { connector } = useConnection()

  const rdns = connector?.id

  return !!rdns && WATCH_ASSET_SUPPORED_WALLETS.includes(rdns)
}

export function useIsRabbyWallet(): boolean {
  const { connector } = useConnection()

  return connector?.id === RABBY_RDNS
}

export function useIsBraveWallet(): boolean {
  const { connector } = useConnection()

  return connector?.id === BRAVE_WALLET_RDNS
}

export function useIsMetamaskBrowserExtensionWallet(): boolean {
  const { connector } = useConnection()

  const isMetamaskConnection = connector?.name.toLowerCase().trim() === 'MetaMask'.toLowerCase().trim()
  const isInjectedConnection = connector?.type === ConnectionType.INJECTED

  if (isMetamaskConnection) return true

  if (!connector || !isInjectedConnection) return false

  return METAMASK_RDNS === connector.id
}
