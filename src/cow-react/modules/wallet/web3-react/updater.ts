import { GnosisSafeInfo, WalletDetails, WalletInfo } from '../api/types'
import useENSName from 'hooks/useENSName'
import { useWeb3React } from '@web3-react/core'
import { useIsSmartContractWallet } from '@cow/common/hooks/useIsSmartContractWallet'
import { useIsGnosisSafeWallet, useWalletMetaData } from '@cow/modules/wallet'
import { useEffect, useMemo, useState } from 'react'

import { UNSUPPORTED_WC_WALLETS } from 'constants/index'
import { useSetAtom } from 'jotai'
import { gnosisSafeInfoAtom, walletDetailsAtom, walletInfoAtom } from '../api/state'
import { getSafeInfo } from '@cow/api/gnosisSafe'
import { useGnosisSafeSdkInfo } from './hooks/useGnosisSafeSdkInfo'

function _checkIsSupportedWallet(walletName?: string): boolean {
  if (walletName && UNSUPPORTED_WC_WALLETS.has(walletName)) {
    // Unsupported wallet
    return false
  }

  return true
}

function _useWalletInfo(): WalletInfo {
  const { account, chainId, isActive: active } = useWeb3React()

  return useMemo(
    () => ({
      chainId,
      active,
      account,
    }),
    [chainId, active, account]
  )
}

function _useWalletDetails(account?: string): WalletDetails {
  const { ENSName: ensName } = useENSName(account ?? undefined)
  const isSmartContractWallet = useIsSmartContractWallet()
  const { walletName, icon } = useWalletMetaData()

  return useMemo(() => {
    return {
      isSmartContractWallet,
      walletName,
      icon,
      ensName: ensName || undefined,
      isSupportedWallet: _checkIsSupportedWallet(walletName),

      // TODO: For now, all SC wallets use pre-sign instead of offchain signing
      // In the future, once the API adds EIP-1271 support, we can allow some SC wallets to use offchain signing
      allowsOffchainSigning: !isSmartContractWallet,
    }
  }, [isSmartContractWallet, walletName, icon, ensName])
}

function _useSafeInfo(walletInfo: WalletInfo): GnosisSafeInfo | undefined {
  const { provider, connector } = useWeb3React()
  const { account, chainId, active } = walletInfo
  const isGnosisSafeConnected = useIsGnosisSafeWallet()
  const [safeInfo, setSafeInfo] = useState<GnosisSafeInfo>()
  const { isReadOnly } = useGnosisSafeSdkInfo(connector, active) || {}

  useEffect(() => {
    if (chainId && account && isGnosisSafeConnected && provider) {
      getSafeInfo(chainId, account, provider)
        .then((_safeInfo) =>
          setSafeInfo({
            isReadOnly,
            ..._safeInfo,
          })
        )
        .catch((error) => {
          console.error('[WalletUpdater] Error getting Safe Info', error)
        })
    } else {
      setSafeInfo(undefined)
    }
  }, [setSafeInfo, chainId, account, isGnosisSafeConnected, provider, isReadOnly])

  return safeInfo
}

export function WalletUpdater() {
  const walletInfo = _useWalletInfo()
  const walletDetails = _useWalletDetails(walletInfo.account)
  const gnosisSafeInfo = _useSafeInfo(walletInfo)

  const setWalletInfo = useSetAtom(walletInfoAtom)
  const setWalletDetails = useSetAtom(walletDetailsAtom)
  const setGnosisSafeInfo = useSetAtom(gnosisSafeInfoAtom)

  // Update wallet info
  useEffect(() => {
    console.log('[WalletUpdater] setWalletInfo', walletInfo)
    setWalletInfo(walletInfo)
  }, [walletInfo, setWalletInfo])

  // Update wallet details
  useEffect(() => {
    console.log('[WalletUpdater] setWalletDetails', walletDetails)
    setWalletDetails(walletDetails)
  }, [walletDetails, setWalletDetails])

  // Update Gnosis Safe info
  useEffect(() => {
    console.log('[WalletUpdater] setGnosisSafeInfo', gnosisSafeInfo)
    setGnosisSafeInfo(gnosisSafeInfo)
  }, [gnosisSafeInfo, setGnosisSafeInfo])

  return null
}
