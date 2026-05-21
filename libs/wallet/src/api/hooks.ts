import { useAtomValue } from 'jotai'

import { useConnection } from 'wagmi'

import { AccountType } from '@cowprotocol/types'

import { useWalletCapabilities } from './hooks/useWalletCapabilities'
import {
  gnosisSafeInfoAtom,
  walletDetailsAtom,
  walletDisplayedAddress,
  walletInfoAtom,
  isEagerConnectInProgressAtom,
} from './state'
import { ConnectionType, GnosisSafeInfo, WalletDetails, WalletInfo } from './types'

import { BRAVE_WALLET_RDNS, METAMASK_RDNS, RABBY_RDNS, WATCH_ASSET_SUPPORED_WALLETS } from '../constants'
import { useAccountType, useIsSmartContractWallet } from '../wagmi/hooks/useIsSmartContractWallet'
import { useIsSafeApp, useIsSafeViaWc, useIsSafeWallet } from '../wagmi/hooks/useWalletMetadata'

export function useGnosisSafeInfo(): GnosisSafeInfo | undefined {
  return useAtomValue(gnosisSafeInfoAtom)
}

export function useIsAssetWatchingSupported(): boolean {
  const { connector } = useConnection()

  const rdns = connector?.id

  return !!rdns && WATCH_ASSET_SUPPORED_WALLETS.includes(rdns)
}

export function useIsBraveWallet(): boolean {
  const { connector } = useConnection()

  return connector?.id === BRAVE_WALLET_RDNS
}

export function useIsEagerConnectInProgress(): boolean {
  return useAtomValue(isEagerConnectInProgressAtom)
}

export function useIsMetamaskBrowserExtensionWallet(): boolean {
  const { connector } = useConnection()

  const isMetamaskConnection = connector?.name.toLowerCase().trim() === 'MetaMask'.toLowerCase().trim()
  const isInjectedConnection = connector?.type === ConnectionType.INJECTED

  if (isMetamaskConnection) return true

  if (!connector || !isInjectedConnection) return false

  return METAMASK_RDNS === connector.id
}

export function useIsRabbyWallet(): boolean {
  const { connector } = useConnection()

  return connector?.id === RABBY_RDNS
}

export function useIsTxBundlingSupported(): boolean | null {
  // TODO this will be fixed in M-3 COW-569
  const { data: capabilities, isLoading: isCapabilitiesLoading } = useWalletCapabilities()
  const isSafeApp = useIsSafeApp()
  const isSafeViaWc = useIsSafeViaWc()
  const accountType = useAccountType()
  const isSmartContractWallet = useIsSmartContractWallet()
  const isSafeWallet = useIsSafeWallet()

  const result = (() => {
    if (isSafeApp || isSafeViaWc) return true
    // Smart accounts (ERC-4337, Coinbase Smart Wallet, EIP-7702, etc.) that are not a Safe lack the
    // fallback handler mechanism TWAP requires — treat them as unsupported.
    // Note: useIsSmartContractWallet() only detects AccountType.SMART_CONTRACT, not EIP-7702 accounts
    // (which keep the same EOA address but have delegation bytecode). We check both explicitly.
    if ((isSmartContractWallet || accountType === AccountType.EIP7702EOA) && !isSafeWallet) return false
    if (isCapabilitiesLoading) return null
    return capabilities?.atomic?.status === 'supported'
  })()

  return result
}

export function useWalletDetails(): WalletDetails {
  return useAtomValue(walletDetailsAtom)
}

export function useWalletDisplayedAddress(): string {
  return useAtomValue(walletDisplayedAddress)
}

export function useWalletInfo(): WalletInfo {
  return useAtomValue(walletInfoAtom)
}
