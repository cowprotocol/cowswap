import { useAtomValue, useSetAtom } from 'jotai'
import { useEffect, useMemo, useState, useSyncExternalStore } from 'react'

import { getCurrentChainIdFromUrl, getRawCurrentChainIdFromUrl } from '@cowprotocol/common-utils'
import { getSafeInfo } from '@cowprotocol/core'
import { SupportedChainId } from '@cowprotocol/cow-sdk'

import ms from 'ms.macro'
import { Address } from 'viem'
import { useConnection, useEnsName } from 'wagmi'

import { useIsSmartContractWallet } from './hooks/useIsSmartContractWallet'
import { useSafeAppsSdk } from './hooks/useSafeAppsSdk'
import { useIsSafeApp, useWalletMetaData } from './hooks/useWalletMetadata'

import { useSetEip6963Provider } from '../api/hooks'
import { gnosisSafeInfoAtom, walletDetailsAtom, walletInfoAtom } from '../api/state'
import { multiInjectedProvidersAtom } from '../api/state/multiInjectedProvidersAtom'
import { ConnectionType, GnosisSafeInfo, WalletDetails, WalletInfo } from '../api/types'
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
  const { address, chainId, isConnected } = useConnection()
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
    }
  }, [address, chainId, isConnected, isChainIdUnsupported, lastStableChainId, lastResolvedChainId, urlKey])

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

function useWalletDetails(account?: Address, standaloneMode?: boolean): WalletDetails {
  const { data: ensName } = useEnsName({ address: account, chainId: SupportedChainId.MAINNET })
  const isSmartContractWallet = useIsSmartContractWallet()
  const { walletName, icon } = useWalletMetaData(standaloneMode)
  const isSafeApp = useIsSafeApp()

  return useMemo(() => {
    return {
      isSmartContractWallet,
      walletName,
      icon,
      ensName: ensName || undefined,
      isSupportedWallet: checkIsSupportedWallet(walletName),

      // TODO: For now, all SC wallets use pre-sign instead of offchain signing
      // In the future, once the API adds EIP-1271 support, we can allow some SC wallets to use offchain signing
      allowsOffchainSigning: !isSmartContractWallet,
      isSafeApp,
    }
  }, [isSmartContractWallet, isSafeApp, walletName, icon, ensName])
}

// used for on-chain calls
let shortSafeInfoInterval: ReturnType<typeof setInterval> | null = null
let longSafeInfoInterval: ReturnType<typeof setInterval> | null = null

interface WalletUpdaterProps {
  standaloneMode?: boolean
}

export function WalletUpdater({ standaloneMode }: WalletUpdaterProps): null {
  const { connector } = useConnection()
  const walletInfo = useWalletInfo()
  const walletDetails = useWalletDetails(walletInfo.account, standaloneMode)
  const gnosisSafeInfo = useSafeInfo()

  const setWalletInfo = useSetAtom(walletInfoAtom)
  const setWalletDetails = useSetAtom(walletDetailsAtom)
  const setGnosisSafeInfo = useSetAtom(gnosisSafeInfoAtom)
  const setEip6963Provider = useSetEip6963Provider()
  const eip6963Providers = useAtomValue(multiInjectedProvidersAtom)

  // Detect and set the EIP-6963 provider RDNS when an injected wallet connects
  useEffect(() => {
    if (
      !connector ||
      (connector.type !== ConnectionType.INJECTED && connector.type !== 'announced') ||
      !eip6963Providers.length
    ) {
      return
    }

    const detect = async (): Promise<void> => {
      try {
        const connectorProvider = await connector.getProvider()
        const match = eip6963Providers.find((p) => p.provider === connectorProvider)
        if (match) {
          setEip6963Provider(match.info.rdns)
        }
      } catch {
        // ignore
      }
    }
    detect()
  }, [connector, eip6963Providers, setEip6963Provider])

  useEffect(() => {
    console.log('[SAFE-DEBUG][WalletUpdater] walletInfo changed', walletInfo)
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
    console.log('[SAFE-DEBUG][WalletUpdater] gnosisSafeInfo changed', gnosisSafeInfo)
    setGnosisSafeInfo(gnosisSafeInfo)
  }, [gnosisSafeInfo, setGnosisSafeInfo])

  return null
}

function useSafeInfo(): GnosisSafeInfo | undefined {
  const safeAppsSdk = useSafeAppsSdk()
  const { account, chainId } = useWalletInfo()

  const [safeInfo, setSafeInfo] = useState<GnosisSafeInfo | undefined>()

  useEffect(() => {
    const updateSafeInfo: () => Promise<void> = async () => {
      console.log('[SAFE-DEBUG][useSafeInfo] updateSafeInfo called', { hasSdk: !!safeAppsSdk, account, chainId })
      if (safeAppsSdk) {
        try {
          const appsSdkSafeInfo = await safeAppsSdk.safe.getInfo()
          console.log('[SAFE-DEBUG][useSafeInfo] getInfo() success', appsSdkSafeInfo)
          setSafeInfo((prevSafeInfo) => {
            const { safeAddress, threshold, owners, isReadOnly, nonce } = appsSdkSafeInfo
            return {
              ...prevSafeInfo,
              address: safeAddress,
              chainId,
              threshold,
              owners,
              nonce: Number(nonce),
              isReadOnly,
            }
          })
        } catch (e) {
          console.log('[SAFE-DEBUG][useSafeInfo] getInfo() ERROR', e)
          console.debug(`[WalletUpdater] Error fetching safe info over iframe ${account}`)
          // Do NOT reset to undefined on error: a transient getInfo() failure during chain transition
          // would make useIsSafeWallet() return false, which briefly makes isSmartContractWallet false,
          // which triggers the CrossChainUnlockScreen ("Cross-chain swaps are here") for Safe users.
          // The previous safeInfo value is good enough until the next successful poll (every 5s).
        }
      } else {
        if (chainId && account) {
          console.log('[SAFE-DEBUG][useSafeInfo] no SDK, fetching via getSafeInfo API', { chainId, account })
          try {
            const _safeInfo = await getSafeInfo(chainId, account)
            console.log('[SAFE-DEBUG][useSafeInfo] getSafeInfo() success', _safeInfo)
            const { address, threshold, owners, nonce } = _safeInfo
            setSafeInfo((prevSafeInfo) => ({
              ...prevSafeInfo,
              chainId,
              address,
              threshold,
              owners,
              // Time to time Safe sends a string or a number
              nonce: Number(nonce),
              isReadOnly: false,
            }))
          } catch {
            console.log('[SAFE-DEBUG][useSafeInfo] getSafeInfo() failed — not a Safe, clearing safeInfo')
            console.debug(`[WalletUpdater] Address ${account} is likely not a Safe (API didn't return Safe info)`)
            setSafeInfo(undefined)
          }
        } else {
          console.log('[SAFE-DEBUG][useSafeInfo] no SDK, no account/chainId — clearing safeInfo', { chainId, account })
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
    }

    updateSafeInfo()

    return () => {
      clearInterval(shortSafeInfoInterval !== null ? shortSafeInfoInterval : undefined)
      shortSafeInfoInterval = null
      clearInterval(longSafeInfoInterval !== null ? longSafeInfoInterval : undefined)
      longSafeInfoInterval = null
    }
  }, [chainId, account, safeAppsSdk])

  return safeInfo
}
