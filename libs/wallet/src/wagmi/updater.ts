import { useSetAtom } from 'jotai'
import { useEffect, useMemo, useRef, useState } from 'react'

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

const SAFE_INFO_POLL_INTERVAL = 3000

function useSafeInfo(walletInfo: WalletInfo): GnosisSafeInfo | undefined {
  const { account, chainId } = walletInfo
  const { connected, sdk } = useSafeAppsSDK()

  const [safeInfo, setSafeInfo] = useState<GnosisSafeInfo>()
  // Use ref to track last isReadOnly value - avoids state updates when polling returns same value
  const lastIsReadOnlyRef = useRef<boolean | undefined>(undefined)

  useEffect(() => {
    if (!connected) {
      // Only use API fallback when NOT in Safe App context
      if (chainId && account) {
        let isStale = false
        const fetchSafeInfo = async (): Promise<void> => {
          try {
            const _safeInfo = await getSafeInfo(chainId, account)
            if (isStale) return
            const { address, threshold, owners, nonce } = _safeInfo
            lastIsReadOnlyRef.current = false
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
              lastIsReadOnlyRef.current = undefined
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
      if (!account) {
        lastIsReadOnlyRef.current = undefined
        setSafeInfo(undefined)
      }
      return undefined
    }

    // In Safe App context - poll for isReadOnly changes
    let isStale = false

    const fetchInfo = async (): Promise<void> => {
      if (isStale) return
      try {
        const fetchedInfo = await sdk.safe.getInfo()
        if (isStale) return

        // Only update state if isReadOnly actually changed - this prevents unnecessary re-renders
        if (lastIsReadOnlyRef.current !== fetchedInfo.isReadOnly) {
          lastIsReadOnlyRef.current = fetchedInfo.isReadOnly
          setSafeInfo({
            address: fetchedInfo.safeAddress,
            chainId: fetchedInfo.chainId,
            threshold: fetchedInfo.threshold,
            owners: fetchedInfo.owners,
            nonce: 0,
            isReadOnly: fetchedInfo.isReadOnly,
          })
        }
      } catch {
        // Ignore polling errors
      }
    }

    // Initial fetch
    fetchInfo()

    // Poll for changes - only triggers state update when isReadOnly changes
    const intervalId = setInterval(fetchInfo, SAFE_INFO_POLL_INTERVAL)

    return () => {
      isStale = true
      clearInterval(intervalId)
    }
  }, [account, chainId, connected, sdk])

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
