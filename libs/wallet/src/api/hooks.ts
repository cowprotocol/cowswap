import { useAtomValue, useSetAtom } from 'jotai'

import { useWalletCapabilities } from './hooks/useWalletCapabilities'
import { gnosisSafeInfoAtom, walletDetailsAtom, walletDisplayedAddress, walletInfoAtom } from './state'
import {
  multiInjectedProvidersAtom,
  selectedEip6963ProviderAtom,
  selectedEip6963ProviderRdnsAtom,
} from './state/multiInjectedProvidersAtom'
import { ConnectionType, GnosisSafeInfo, WalletDetails, WalletInfo } from './types'

import { METAMASK_RDNS, RABBY_RDNS, WATCH_ASSET_SUPPORED_WALLETS } from '../constants'
import { useConnectionType } from '../web3-react/hooks/useConnectionType'
import { useIsSafeApp, useIsSafeViaWc } from '../web3-react/hooks/useWalletMetadata'

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

export function useIsMetamaskBrowserExtensionWallet(): boolean {
  const connectionType = useConnectionType()
  const info = useSelectedEip6963ProviderInfo()

  if (connectionType === ConnectionType.METAMASK) return true

  if (!info || connectionType !== ConnectionType.INJECTED) return false

  return METAMASK_RDNS === info.info.rdns
}
