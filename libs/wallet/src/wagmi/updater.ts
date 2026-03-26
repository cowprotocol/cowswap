import { useSetAtom } from 'jotai'
import { useEffect, useMemo, useState } from 'react'

import { getCurrentChainIdFromUrl } from '@cowprotocol/common-utils'
import { getSafeInfo } from '@cowprotocol/core'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { useENSName } from '@cowprotocol/ens'
import { useSafeAppsSDK } from '@safe-global/safe-apps-react-sdk'

import { Address } from 'viem'
import { useChainId, useConnection } from 'wagmi'

import { useIsSmartContractWallet } from './hooks/useIsSmartContractWallet'
import { useIsSafeApp, useWalletMetaData } from './hooks/useWalletMetadata'

import { gnosisSafeInfoAtom, walletDetailsAtom, walletInfoAtom } from '../api/state'
import { GnosisSafeInfo, WalletDetails, WalletInfo } from '../api/types'
import { getWalletType } from '../api/utils/getWalletType'
import { getWalletTypeLabel } from '../api/utils/getWalletTypeLabel'

function useWalletInfo(): WalletInfo {
  const { address, isConnected } = useConnection()
  const chainId = useChainId()
  const isChainIdUnsupported = !!chainId && !(chainId in SupportedChainId)

  return useMemo(
    () => ({
      chainId: isChainIdUnsupported || !chainId ? getCurrentChainIdFromUrl() : chainId,
      active: isConnected,
      account: address,
    }),
    [address, chainId, isConnected, isChainIdUnsupported],
  )
}

// Smart contract wallets are filtered out by default, no need to add them to this list
const UNSUPPORTED_WC_WALLETS = new Set(['DeFi Wallet', 'WallETH'])

function checkIsSupportedWallet(walletName?: string): boolean {
  return !(walletName && UNSUPPORTED_WC_WALLETS.has(walletName))
}

function useWalletDetails(account?: Address, standaloneMode?: boolean): WalletDetails {
  const { ENSName: ensName } = useENSName(account ?? undefined)
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

function useSafeInfo(walletInfo: WalletInfo): GnosisSafeInfo | undefined {
  const { account, chainId } = walletInfo
  const { connected, safe } = useSafeAppsSDK()

  const [safeInfo, setSafeInfo] = useState<GnosisSafeInfo>()

  // When connected as Safe App, use the safe object directly from SDK context
  useEffect(() => {
    // Track if this effect has been cleaned up (to prevent stale async updates)
    let isStale = false

    // If we're in Safe App context (connected via Safe SDK), use SDK data
    // This takes priority over API fallback
    if (connected && safe.safeAddress) {
      setSafeInfo({
        address: safe.safeAddress,
        chainId: safe.chainId,
        threshold: safe.threshold,
        owners: safe.owners,
        nonce: 0,
        isReadOnly: safe.isReadOnly,
      })
      // Return cleanup that marks this as stale
      return () => {
        isStale = true
      }
    }

    // Only use API fallback when NOT in Safe App context
    if (!connected && chainId && account) {
      const fetchSafeInfo = async (): Promise<void> => {
        try {
          const _safeInfo = await getSafeInfo(chainId, account)
          // Don't update if the effect was cleaned up (e.g., Safe SDK connected in the meantime)
          if (isStale) {
            return
          }
          const { address, threshold, owners, nonce } = _safeInfo
          setSafeInfo({
            chainId,
            address,
            threshold,
            owners,
            nonce: Number(nonce),
            isReadOnly: false,
          })
        } catch {
          if (!isStale) {
            setSafeInfo(undefined)
          }
        }
      }
      fetchSafeInfo()
      return () => {
        isStale = true
      }
    }

    // No Safe context and no account - clear info
    if (!connected && !account) {
      setSafeInfo(undefined)
    }

    return () => {
      isStale = true
    }
  }, [account, chainId, connected, safe])

  return safeInfo
}

interface WalletUpdaterProps {
  standaloneMode?: boolean
}

export function WalletUpdater({ standaloneMode }: WalletUpdaterProps): null {
  const walletInfo = useWalletInfo()
  const walletDetails = useWalletDetails(walletInfo.account, standaloneMode)
  const gnosisSafeInfo = useSafeInfo(walletInfo)

  const setWalletInfo = useSetAtom(walletInfoAtom)
  const setWalletDetails = useSetAtom(walletDetailsAtom)
  const setGnosisSafeInfo = useSetAtom(gnosisSafeInfoAtom)

  // Update wallet info
  useEffect(() => {
    setWalletInfo(walletInfo)
  }, [walletInfo, setWalletInfo])

  // Update wallet details
  useEffect(() => {
    const walletType = getWalletType({ gnosisSafeInfo, isSmartContractWallet: walletDetails.isSmartContractWallet })
    setWalletDetails({
      ...walletDetails,
      walletName: walletDetails.walletName || getWalletTypeLabel(walletType),
    })
  }, [walletDetails, setWalletDetails, gnosisSafeInfo])

  // Update Gnosis Safe info
  useEffect(() => {
    setGnosisSafeInfo(gnosisSafeInfo)
  }, [gnosisSafeInfo, setGnosisSafeInfo])

  return null
}
