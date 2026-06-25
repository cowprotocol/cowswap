import { useAtomValue } from 'jotai'
import { useMemo } from 'react'

import { AccountType } from '@cowprotocol/types'

import { useConnection } from 'wagmi'

import { useWalletCapabilities } from './hooks/useWalletCapabilities'
import {
  gnosisSafeInfoAtom,
  walletDetailsAtom,
  walletDisplayedAddress,
  walletInfoAtom,
  isEagerConnectInProgressAtom,
} from './state'
import { ConnectionType, GnosisSafeInfo, WalletDetails, WalletInfo } from './types'
import { getInjectedProvider } from './utils/connection'
import { getWalletRdns, isGenericInjectedConnector } from './utils/walletIdentity'

import { BRAVE_WALLET_RDNS, METAMASK_RDNS, RABBY_RDNS, WATCH_ASSET_SUPPORED_WALLETS } from '../constants'
import { useAccountType, useIsSmartContractWallet } from '../wagmi/hooks/useIsSmartContractWallet'
import { useIsSafeApp, useIsSafeWallet } from '../wagmi/hooks/useWalletMetadata'

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
  const { data: capabilities, isLoading: isCapabilitiesLoading } = useWalletCapabilities()
  const isSafeApp = useIsSafeApp()
  const accountType = useAccountType()
  const isSmartContractWallet = useIsSmartContractWallet()
  const isSafeWallet = useIsSafeWallet()

  // eslint-disable-next-line complexity
  return useMemo(() => {
    if (isSafeApp) return true
    // Smart accounts (ERC-4337, Coinbase Smart Wallet, EIP-7702, etc.) that are not a Safe lack the
    // fallback handler mechanism TWAP requires — treat them as unsupported.
    // Note: useIsSmartContractWallet() only detects AccountType.SMART_CONTRACT, not EIP-7702 accounts
    // (which keep the same EOA address but have delegation bytecode). We check both explicitly.
    if ((isSmartContractWallet || accountType === AccountType.EIP7702EOA) && !isSafeWallet) return false
    if (isCapabilitiesLoading) return null
    return Boolean(capabilities?.atomic?.status === 'supported' || capabilities?.atomicBatch?.supported)
  }, [isSafeApp, isSmartContractWallet, accountType, isCapabilitiesLoading, capabilities, isSafeWallet])
}

export function useIsAssetWatchingSupported(): boolean {
  const { connector } = useConnection()

  const rdns = getWalletRdns({ connector, provider: getInjectedProviderForIdentity(connector) })

  return !!rdns && WATCH_ASSET_SUPPORED_WALLETS.includes(rdns)
}

export function useIsRabbyWallet(): boolean {
  const { connector } = useConnection()

  return getWalletRdns({ connector, provider: getInjectedProviderForIdentity(connector) }) === RABBY_RDNS
}

export function useIsBraveWallet(): boolean {
  const { connector } = useConnection()

  return getWalletRdns({ connector, provider: getInjectedProviderForIdentity(connector) }) === BRAVE_WALLET_RDNS
}

export function useIsMetamaskBrowserExtensionWallet(): boolean {
  const { connector } = useConnection()

  const isMetamaskConnection = connector?.name.toLowerCase().trim() === 'MetaMask'.toLowerCase().trim()
  const isInjectedConnection = connector?.type === ConnectionType.INJECTED

  if (isMetamaskConnection) return true

  if (!connector || !isInjectedConnection) return false

  return METAMASK_RDNS === getWalletRdns({ connector, provider: getInjectedProviderForIdentity(connector) })
}

function getInjectedProviderForIdentity(connector?: { id?: string; type?: string }): unknown {
  if (!isGenericInjectedConnector(connector)) return undefined

  return getInjectedProvider()
}
