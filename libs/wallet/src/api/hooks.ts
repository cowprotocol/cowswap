import { useAtomValue, useSetAtom } from 'jotai'
import { useCallback } from 'react'

import { AccountType } from '@cowprotocol/types'

import { useConnection } from 'wagmi'

import { useWalletCapabilities } from './hooks/useWalletCapabilities'
import {
  gnosisSafeInfoAtom,
  walletDetailsAtom,
  walletDisplayedAddress,
  walletInfoAtom,
  eagerConnectPendingOpsAtom,
  isEagerConnectInProgressAtom,
} from './state'
import {
  multiInjectedProvidersAtom,
  selectedEip6963ProviderAtom,
  selectedEip6963ProviderRdnsAtom,
} from './state/multiInjectedProvidersAtom'
import { ConnectionType, GnosisSafeInfo, WalletDetails, WalletInfo } from './types'

import { BRAVE_WALLET_RDNS, METAMASK_RDNS, RABBY_RDNS, WATCH_ASSET_SUPPORED_WALLETS } from '../constants'
import { useConnectionType } from '../wagmi/hooks/useConnectionType'
import { useAccountType, useIsSmartContractWallet } from '../wagmi/hooks/useIsSmartContractWallet'
import { useIsSafeApp, useIsSafeViaWc, useIsSafeWallet } from '../wagmi/hooks/useWalletMetadata'

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

export function useBeginEagerConnect(): () => void {
  const set = useSetAtom(eagerConnectPendingOpsAtom)
  return useCallback(() => set((prev) => prev + 1), [set])
}

export function useEndEagerConnect(): () => void {
  const set = useSetAtom(eagerConnectPendingOpsAtom)
  return useCallback(() => set((prev) => (prev > 0 ? prev - 1 : 0)), [set])
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

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function useMultiInjectedProviders() {
  return useAtomValue(multiInjectedProvidersAtom)
}

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function useSetEip6963Provider() {
  return useSetAtom(selectedEip6963ProviderRdnsAtom)
}

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function useSelectedEip6963ProviderRdns() {
  return useAtomValue(selectedEip6963ProviderRdnsAtom)
}

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function useSelectedEip6963ProviderInfo() {
  return useAtomValue(selectedEip6963ProviderAtom)
}

export function useIsAssetWatchingSupported(): boolean {
  const connectionType = useConnectionType()
  const info = useSelectedEip6963ProviderInfo()

  const isInjectedConnection = connectionType === ConnectionType.INJECTED

  if (!info || !isInjectedConnection) return false

  // TODO: check other wallets and extend the array
  return WATCH_ASSET_SUPPORED_WALLETS.includes(info.info.rdns)
}

export function useIsRabbyWallet(): boolean {
  const connectionType = useConnectionType()
  const info = useSelectedEip6963ProviderInfo()

  const isInjectedConnection = connectionType === ConnectionType.INJECTED

  if (!info || !isInjectedConnection) return false

  return RABBY_RDNS === info.info.rdns
}

export function useIsBraveWallet(): boolean {
  const connectionType = useConnectionType()
  const info = useSelectedEip6963ProviderInfo()

  const isInjectedConnection = connectionType === ConnectionType.INJECTED

  if (!info || !isInjectedConnection) return false

  return BRAVE_WALLET_RDNS === info.info.rdns
}

export function useIsMetamaskBrowserExtensionWallet(): boolean {
  const { connector } = useConnection()
  const info = useSelectedEip6963ProviderInfo()

  const isMetamaskConnection = connector?.name.toLowerCase().trim() === 'MetaMask'.toLowerCase().trim()
  const isInjectedConnection = connector?.type === ConnectionType.INJECTED

  if (isMetamaskConnection) return true

  if (!info || !isInjectedConnection) return false

  return METAMASK_RDNS === info.info.rdns
}
