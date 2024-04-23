import { useSetAtom } from 'jotai'
import { useEffect, useMemo, useState } from 'react'

import { getCurrentChainIdFromUrl } from '@cowprotocol/common-utils'
import { getSafeInfo } from '@cowprotocol/core'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { useENSName } from '@cowprotocol/ens'

import { useSafeAppsSdkInfo } from './hooks/useSafeAppsSdkInfo'
import { useWalletMetaData } from './hooks/useWalletMetadata'

import { gnosisSafeInfoAtom, walletDetailsAtom, walletInfoAtom } from '../api/state'
import { GnosisSafeInfo, WalletDetails, WalletInfo } from '../api/types'
import { getWalletType } from '../api/utils/getWalletType'
import { getWalletTypeLabel } from '../api/utils/getWalletTypeLabel'
import { useIsSmartContractWallet } from './hooks/useIsSmartContractWallet'
import ms from 'ms.macro'
import { useWeb3ModalAccount, useWeb3ModalTheme } from '@web3modal/ethers5/react'
import { useWalletProvider } from '@cowprotocol/wallet-provider'
import { useLocation } from 'react-router-dom'

const SAFE_INFO_UPDATE_INTERVAL = ms`30s`

// Smart contract wallets are filtered out by default, no need to add them to this list
const UNSUPPORTED_WC_WALLETS = new Set(['DeFi Wallet', 'WallETH'])

function _checkIsSupportedWallet(walletName?: string): boolean {
  return !(walletName && UNSUPPORTED_WC_WALLETS.has(walletName))
}

function _useWalletInfo(): WalletInfo {
  const { address, chainId, isConnected: active } = useWeb3ModalAccount()
  const isChainIdUnsupported = !!chainId && !(chainId in SupportedChainId)
  const location = useLocation()

  return useMemo(() => {
    return {
      chainId: isChainIdUnsupported || !chainId ? getCurrentChainIdFromUrl() : chainId,
      active,
      account: address,
    }
    /**
     * The hook should be recalculated when location changes,
     * because when wallet is not connected, we should rely on the URL to get the chainId
     */
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chainId, active, address, isChainIdUnsupported, location])
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
  const provider = useWalletProvider()
  const { account, chainId } = walletInfo
  const [safeInfo, setSafeInfo] = useState<GnosisSafeInfo>()
  const { isReadOnly } = useSafeAppsSdkInfo() || {}

  useEffect(() => {
    const update = () => {
      if (chainId && account && provider) {
        getSafeInfo(chainId, account, provider)
          .then((_safeInfo) =>
            setSafeInfo({
              isReadOnly,
              ..._safeInfo,
            })
          )
          .catch((error) => {
            console.debug(`[WalletUpdater] Address ${account} is likely not a Safe (API didn't return Safe info)`)
            setSafeInfo(undefined)
          })
      } else {
        setSafeInfo(undefined)
      }
    }

    const interval = setInterval(update, SAFE_INFO_UPDATE_INTERVAL)

    update()

    return () => clearInterval(interval)
  }, [setSafeInfo, chainId, account, provider, isReadOnly])

  return safeInfo
}

export function WalletUpdater({ darkMode }: { darkMode: boolean }) {
  const walletInfo = _useWalletInfo()
  const walletDetails = _useWalletDetails(walletInfo.account)
  const gnosisSafeInfo = _useSafeInfo(walletInfo)

  const setWalletInfo = useSetAtom(walletInfoAtom)
  const setWalletDetails = useSetAtom(walletDetailsAtom)
  const setGnosisSafeInfo = useSetAtom(gnosisSafeInfoAtom)

  const { setThemeMode } = useWeb3ModalTheme()

  // Update wallet info
  useEffect(() => {
    setWalletInfo(walletInfo)
  }, [walletInfo, setWalletInfo])

  // Update wallet details
  useEffect(() => {
    const walletType = getWalletType({ gnosisSafeInfo, isSmartContractWallet: walletDetails.isSmartContractWallet })
    setWalletDetails({
      walletName: getWalletTypeLabel(walletType), // Fallback wallet name, will be overridden by below line if something exists.
      ...walletDetails,
    })
  }, [walletDetails, setWalletDetails, gnosisSafeInfo])

  // Update Gnosis Safe info
  useEffect(() => {
    setGnosisSafeInfo(gnosisSafeInfo)
  }, [gnosisSafeInfo, setGnosisSafeInfo])

  // Sync web3modal theme with the app theme
  useEffect(() => {
    setThemeMode(darkMode ? 'dark' : 'light')
  }, [darkMode, setThemeMode])

  return null
}
