import { useSetAtom } from 'jotai'
import { useEffect, useMemo, useState, useSyncExternalStore } from 'react'

import { getCurrentChainIdFromUrl, getRawCurrentChainIdFromUrl, logSafeApi } from '@cowprotocol/common-utils'
import { getSafeInfo, normalizeSafeError } from '@cowprotocol/core'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { AccountType } from '@cowprotocol/types'
import type { SafeInfoResponse } from '@safe-global/api-kit'
import type { SafeInfoExtended } from '@safe-global/safe-apps-sdk'

import ms from 'ms.macro'
import { Address } from 'viem'
import { useEnsName } from 'wagmi'

import { useAccountState } from './hooks/useAccountState'
import { useAccountType, useIsSmartContractWallet } from './hooks/useIsSmartContractWallet'
import { useSafeAppsSdk } from './hooks/useSafeAppsSdk'
import { useIsSafeApp, useIsSafeViaWc, useWalletMetaData } from './hooks/useWalletMetadata'

import { useIsMetamaskBrowserExtensionWallet } from '../api/hooks'
import { gnosisSafeInfoAtom, walletDetailsAtom, walletInfoAtom } from '../api/state'
import { GnosisSafeInfo, WalletDetails, WalletInfo } from '../api/types'
import { getWalletType } from '../api/utils/getWalletType'
import { getWalletTypeLabel } from '../api/utils/getWalletTypeLabel'

const SAFE_INFO_SHORT_INTERVAL = ms`5s`
// getSafeInfo call does network requests, so we use a longer interval to not spam the servers too much
const SAFE_INFO_LONG_INTERVAL = ms`30s`

function useBrowserUrlKey(): string {
  return useSyncExternalStore(
    (onStoreChange) => {
      window.addEventListener('hashchange', onStoreChange)
      window.addEventListener('popstate', onStoreChange)
      return () => {
        window.removeEventListener('hashchange', onStoreChange)
        window.removeEventListener('popstate', onStoreChange)
      }
    },
    () => `${window.location.pathname}${window.location.search}${window.location.hash}`,
    () => '',
  )
}

function useWalletInfo(): WalletInfo {
  const urlKey = useBrowserUrlKey()
  const { address, chainId, isConnected, status } = useAccountState()
  const isConnectionRestoring = status === 'reconnecting'
  const isChainIdUnsupported = !!chainId && !(chainId in SupportedChainId)
  const [lastStableChainId, setLastStableChainId] = useState<SupportedChainId | undefined>(undefined)
  const [lastResolvedChainId, setLastResolvedChainId] = useState<SupportedChainId>(() => getCurrentChainIdFromUrl())

  useEffect(() => {
    if (!isConnected) {
      setLastStableChainId(undefined)
      return
    }
    if (chainId && !isChainIdUnsupported) {
      setLastStableChainId(chainId as SupportedChainId)
    }
  }, [isConnected, chainId, isChainIdUnsupported])

  const walletInfo = useMemo(() => {
    void urlKey

    let resolvedChainId: SupportedChainId
    if (!isConnected) {
      // Use chain from URL if present; otherwise preserve the last resolved chainId
      // (e.g. when navigating from a path-based route like /56/swap to /account which has no chain in URL)
      resolvedChainId = getRawCurrentChainIdFromUrl() ?? lastResolvedChainId
    } else if (isChainIdUnsupported) {
      resolvedChainId = getCurrentChainIdFromUrl()
    } else if (chainId) {
      resolvedChainId = chainId as SupportedChainId
    } else {
      resolvedChainId = lastStableChainId ?? getCurrentChainIdFromUrl()
    }

    return {
      chainId: resolvedChainId,
      active: isConnected,
      account: address,
      isConnectionRestoring,
    }
  }, [
    address,
    chainId,
    isConnected,
    isChainIdUnsupported,
    isConnectionRestoring,
    lastStableChainId,
    lastResolvedChainId,
    urlKey,
  ])

  useEffect(() => {
    setLastResolvedChainId(walletInfo.chainId)
  }, [walletInfo.chainId])

  return walletInfo
}

// Smart contract wallets are filtered out by default, no need to add them to this list
const UNSUPPORTED_WC_WALLETS = new Set(['DeFi Wallet', 'WallETH'])

function checkIsSupportedWallet(walletName?: string): boolean {
  return !(walletName && UNSUPPORTED_WC_WALLETS.has(walletName))
}

function useWalletDetails(account?: Address): WalletDetails {
  const { data: ensName } = useEnsName({ address: account, chainId: SupportedChainId.MAINNET })
  const isSmartContractWallet = useIsSmartContractWallet()
  const { walletName, icon } = useWalletMetaData()
  const isSafeApp = useIsSafeApp()
  const isMetaMask = useIsMetamaskBrowserExtensionWallet()

  return useMemo(() => {
    return {
      isSmartContractWallet,
      walletName,
      icon,
      ensName: ensName || undefined,
      isSupportedWallet: checkIsSupportedWallet(walletName),

      // EOAs can always sign off-chain. MetaMask smart accounts also support EIP-1271 off-chain
      // signing. All other smart contract wallets (Coinbase Smart Wallet, ERC-4337, Safe, etc.)
      // must use on-chain pre-signing.
      allowsOffchainSigning: !isSmartContractWallet || isMetaMask,
      isSafeApp,
    }
  }, [isSmartContractWallet, isSafeApp, isMetaMask, walletName, icon, ensName])
}

// used for on-chain calls
let shortSafeInfoInterval: ReturnType<typeof setInterval> | null = null
let longSafeInfoInterval: ReturnType<typeof setInterval> | null = null

export function WalletUpdater(): null {
  const walletInfo = useWalletInfo()
  const walletDetails = useWalletDetails(walletInfo.account)
  const gnosisSafeInfo = useSafeInfo()

  const setWalletInfo = useSetAtom(walletInfoAtom)
  const setWalletDetails = useSetAtom(walletDetailsAtom)
  const setGnosisSafeInfo = useSetAtom(gnosisSafeInfoAtom)

  useEffect(() => {
    setWalletInfo(walletInfo)
  }, [walletInfo, setWalletInfo])

  useEffect(() => {
    const walletType = getWalletType({ gnosisSafeInfo, isSmartContractWallet: walletDetails.isSmartContractWallet })
    setWalletDetails({
      walletName: getWalletTypeLabel(walletType),
      ...walletDetails,
    })
  }, [walletDetails, setWalletDetails, gnosisSafeInfo])

  useEffect(() => {
    setGnosisSafeInfo(gnosisSafeInfo)
  }, [gnosisSafeInfo, setGnosisSafeInfo])

  return null
}

function useIsPossibleSafe(): boolean {
  const accountType = useAccountType()
  const isSafeViaWc = useIsSafeViaWc()

  if (!isSafeViaWc) return false
  if (accountType === AccountType.EOA) return false
  if (accountType === AccountType.EIP7702EOA) return false

  return true
}

function useSafeInfo(): GnosisSafeInfo | undefined {
  const safeAppsSdk = useSafeAppsSdk()
  const { account, chainId } = useWalletInfo()
  const isPossibleSafe = useIsPossibleSafe()

  const [safeInfo, setSafeInfo] = useState<GnosisSafeInfo | undefined>()
  const [isKnownNotSafe, setIsKnownNotSafe] = useState(false)
  const shouldFetchSafeInfo = isPossibleSafe && !isKnownNotSafe

  useEffect(() => {
    setIsKnownNotSafe(false)
  }, [chainId, account])

  useEffect(() => {
    const updateSafeInfo: () => Promise<void> = async () => {
      if (safeAppsSdk) {
        try {
          const safeInfoFromSdk = await safeAppsSdk.safe.getInfo()
          setSafeInfo((prevSafeInfo) => parseSafeInfoFromSdk(prevSafeInfo, safeInfoFromSdk, chainId))
        } catch {
          logSafeApi.debug(`Error fetching safe info over iframe ${account}`)
          setSafeInfo(undefined)
        }
      } else {
        if (chainId && account && shouldFetchSafeInfo) {
          try {
            const safeInfoFromApi = await getSafeInfo(chainId, account)
            setIsKnownNotSafe(false)
            setSafeInfo((prevSafeInfo) => parseSafeInfoFromApi(prevSafeInfo, safeInfoFromApi, chainId))
          } catch (err: unknown) {
            const error = normalizeSafeError(err)
            if (error.statusCode === 429) {
              logSafeApi.warn('Fetching safe info: rate limited', account)
            } else if (error.statusCode === 404) {
              logSafeApi.info('Fetching safe info: NOT a safe', account)
              setIsKnownNotSafe(true)
            } else {
              logSafeApi.error(`Unhandled safe error ${error.statusCode}`, account)
            }
            setSafeInfo(undefined)
          }
        } else {
          setSafeInfo(undefined)
        }
      }
    }

    if (safeAppsSdk) {
      // If we are here, we are running as a safe app. The safe app getInfo call doesn't do network requests
      // but uses the local data, so we can use a shorter interval
      clearInterval(longSafeInfoInterval !== null ? longSafeInfoInterval : undefined)
      longSafeInfoInterval = null
      shortSafeInfoInterval = setInterval(updateSafeInfo, SAFE_INFO_SHORT_INTERVAL)
    } else {
      // If we don't have a safeAppsSdk, we are running maybe in walletconnect mode and protocol-kit's
      // getSafeInfo call does network requests, so we use a longer interval to not spam the servers too much
      clearInterval(shortSafeInfoInterval !== null ? shortSafeInfoInterval : undefined)
      shortSafeInfoInterval = null
      longSafeInfoInterval = setInterval(updateSafeInfo, SAFE_INFO_LONG_INTERVAL)
      if (!shouldFetchSafeInfo) {
        clearInterval(longSafeInfoInterval !== null ? longSafeInfoInterval : undefined)
        longSafeInfoInterval = null
        return
      }
    }

    updateSafeInfo()

    return () => {
      clearInterval(shortSafeInfoInterval !== null ? shortSafeInfoInterval : undefined)
      shortSafeInfoInterval = null
      clearInterval(longSafeInfoInterval !== null ? longSafeInfoInterval : undefined)
      longSafeInfoInterval = null
    }
  }, [chainId, account, safeAppsSdk, shouldFetchSafeInfo])

  return safeInfo
}

function parseSafeInfoFromSdk(
  prevSafeInfo: GnosisSafeInfo | undefined,
  safeInfoFromSdk: SafeInfoExtended,
  chainId: SupportedChainId,
): GnosisSafeInfo {
  const { safeAddress, threshold, owners, isReadOnly, nonce } = safeInfoFromSdk
  return {
    ...prevSafeInfo,
    address: safeAddress,
    chainId,
    threshold,
    owners,
    nonce: Number(nonce),
    isReadOnly,
  }
}

function parseSafeInfoFromApi(
  prevSafeInfo: GnosisSafeInfo | undefined,
  safeInfoFromApi: SafeInfoResponse,
  chainId: SupportedChainId,
): GnosisSafeInfo {
  const { address, threshold, owners, nonce } = safeInfoFromApi
  return {
    ...prevSafeInfo,
    chainId,
    address,
    threshold,
    owners,
    // Time to time Safe sends a string or a number
    nonce: Number(nonce),
    isReadOnly: false,
  }
}
