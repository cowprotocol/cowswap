import { useAtomValue, useSetAtom } from 'jotai'

import { gnosisSafeInfoAtom, walletDetailsAtom, walletDisplayedAddress, walletInfoAtom } from './state'
import {
  multiInjectedProvidersAtom,
  selectedEip6963ProviderAtom,
  selectedEip6963ProviderRdnsAtom,
} from './state/multiInjectedProvidersAtom'
import { ConnectionType, GnosisSafeInfo, WalletDetails, WalletInfo } from './types'

import { RABBY_RDNS, WATCH_ASSET_SUPPORED_WALLETS } from '../constants'
import { useConnectionType } from '../web3-react/hooks/useConnectionType'
import { useIsSafeApp } from '../web3-react/hooks/useWalletMetadata'

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

export function useMultiInjectedProviders() {
  return useAtomValue(multiInjectedProvidersAtom)
}

export function useSetEip6963Provider() {
  return useSetAtom(selectedEip6963ProviderRdnsAtom)
}

export function useSelectedEip6963ProviderRdns() {
  return useAtomValue(selectedEip6963ProviderRdnsAtom)
}

export function useSelectedEip6963ProviderInfo() {
  return useAtomValue(selectedEip6963ProviderAtom)
}

export function useIsAssetWatchingSupported(): boolean {
  const connectionType = useConnectionType()
  const info = useSelectedEip6963ProviderInfo()

  if (!info || connectionType !== ConnectionType.INJECTED) return false

  // TODO: check other wallets and extend the array
  return WATCH_ASSET_SUPPORED_WALLETS.includes(info.info.rdns)
}

export function useIsRabbyWallet(): boolean {
  const connectionType = useConnectionType()
  const info = useSelectedEip6963ProviderInfo()

  if (!info || connectionType !== ConnectionType.INJECTED) return false

  return RABBY_RDNS === info.info.rdns
}
