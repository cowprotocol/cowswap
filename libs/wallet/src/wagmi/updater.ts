import { useSetAtom } from 'jotai'
import { useEffect, useMemo, useState, useSyncExternalStore } from 'react'

import { getCurrentChainIdFromUrl } from '@cowprotocol/common-utils'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { useSafeAppsSDK } from '@safe-global/safe-apps-react-sdk'

import ms from 'ms.macro'
import { Address } from 'viem'
import { useConnection, useEnsName } from 'wagmi'

import { useIsSmartContractWallet } from './hooks/useIsSmartContractWallet'
import { useIsSafeApp, useWalletMetaData } from './hooks/useWalletMetadata'

import { gnosisSafeInfoAtom, walletDetailsAtom, walletInfoAtom } from '../api/state'
import { ConnectionType, GnosisSafeInfo, WalletDetails, WalletInfo } from '../api/types'
import { getWalletType } from '../api/utils/getWalletType'
import { getWalletTypeLabel } from '../api/utils/getWalletTypeLabel'

const SAFE_INFO_SHORT_INTERVAL = ms`5s`

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

  useEffect(() => {
    if (!isConnected) {
      setLastStableChainId(undefined)
      return
    }
    if (chainId && !isChainIdUnsupported) {
      setLastStableChainId(chainId as SupportedChainId)
    }
  }, [isConnected, chainId, isChainIdUnsupported])

  return useMemo(() => {
    void urlKey

    let resolvedChainId: SupportedChainId
    if (!isConnected) {
      resolvedChainId = getCurrentChainIdFromUrl()
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
  }, [address, chainId, isConnected, isChainIdUnsupported, lastStableChainId, urlKey])
}

// Smart contract wallets are filtered out by default, no need to add them to this list
const UNSUPPORTED_WC_WALLETS = new Set(['DeFi Wallet', 'WallETH'])

function checkIsSupportedWallet(walletName?: string): boolean {
  return !(walletName && UNSUPPORTED_WC_WALLETS.has(walletName))
}

function useWalletDetails(account?: Address, standaloneMode?: boolean): WalletDetails {
  const { data: ensName } = useEnsName({ address: account })
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

function useSafeInfo(): GnosisSafeInfo | undefined {
  const { connected: reactConnected, sdk } = useSafeAppsSDK()
  const { isConnected, connector } = useConnection()

  const [safeInfo, setSafeInfo] = useState<GnosisSafeInfo | undefined>()

  const shouldFetchSafeInfo =
    !!sdk && (reactConnected || (isConnected && connector?.type === ConnectionType.GNOSIS_SAFE))

  useEffect(() => {
    if (!shouldFetchSafeInfo) {
      setSafeInfo(undefined)
      return
    }

    const fetchAndSet = async (): Promise<void> => {
      try {
        const fetchedInfo = await sdk.safe.getInfo()
        setSafeInfo({ ...fetchedInfo, address: fetchedInfo.safeAddress })
      } catch {
        setSafeInfo(undefined)
      }
    }

    void fetchAndSet()

    const refetch = (): void => {
      void fetchAndSet()
    }

    const onVisibilityChange = (): void => {
      if (document.visibilityState === 'visible') {
        refetch()
      }
    }

    window.addEventListener('focus', refetch)
    document.addEventListener('visibilitychange', onVisibilityChange)

    const intervalId = window.setInterval(refetch, SAFE_INFO_SHORT_INTERVAL)

    return () => {
      window.clearInterval(intervalId)
      window.removeEventListener('focus', refetch)
      document.removeEventListener('visibilitychange', onVisibilityChange)
    }
  }, [shouldFetchSafeInfo, sdk])

  return safeInfo
}

interface WalletUpdaterProps {
  standaloneMode?: boolean
}

export function WalletUpdater({ standaloneMode }: WalletUpdaterProps): null {
  const walletInfo = useWalletInfo()
  const walletDetails = useWalletDetails(walletInfo.account, standaloneMode)
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
      ...walletDetails,
      walletName: getWalletTypeLabel(walletType) || walletDetails.walletName,
    })
  }, [walletDetails, setWalletDetails, gnosisSafeInfo])

  useEffect(() => {
    setGnosisSafeInfo(gnosisSafeInfo)
  }, [gnosisSafeInfo, setGnosisSafeInfo])

  return null
}
