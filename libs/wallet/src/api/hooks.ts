import { useAtomValue, useSetAtom } from 'jotai'

import { gnosisSafeInfoAtom, walletDetailsAtom, walletDisplayedAddress, walletInfoAtom } from './state'
import {
  multiInjectedProvidersAtom,
  selectedEip6963ProviderAtom,
  selectedEip6963ProviderRdnsAtom,
} from './state/multiInjectedProvidersAtom'
import { GnosisSafeInfo, WalletDetails, WalletInfo } from './types'

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
