import { useAtomValue } from 'jotai/utils'
import { WalletDetails, WalletInfo } from '../api/types'
import useENSName from 'hooks/useENSName'
import { useWeb3React } from '@web3-react/core'
import { useIsSmartContractWallet } from '@cow/common/hooks/useIsSmartContractWallet'
import { gnosisSafeAtom } from 'state/gnosisSafe/atoms'
import { useWalletMetaData } from '@cow/modules/wallet'
import { useEffect, useMemo } from 'react'

import { UNSUPPORTED_WC_WALLETS } from 'constants/index'
import { useSetAtom } from 'jotai'
import { walletDetailsAtom, walletInfoAtom } from '../api/state'

function _checkIsSupportedWallet(walletName?: string): boolean {
  if (walletName && UNSUPPORTED_WC_WALLETS.has(walletName)) {
    // Unsupported wallet
    return false
  }

  return true
}

function _useWalletDetails(account?: string): WalletDetails {
  const { ENSName: ensName } = useENSName(account ?? undefined)
  const gnosisSafeInfo = useAtomValue(gnosisSafeAtom)
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
      gnosisSafeInfo,
    }
  }, [isSmartContractWallet, walletName, icon, ensName, gnosisSafeInfo])
}

export function _useWalletInfo(): WalletInfo {
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

export function WalletUpdater() {
  const walletInfo = _useWalletInfo()
  const walletDetails = _useWalletDetails(walletInfo.account)

  const setWalletInfo = useSetAtom(walletInfoAtom)
  const setWalletDetails = useSetAtom(walletDetailsAtom)

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

  return null
}
