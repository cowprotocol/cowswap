import { useCallback } from 'react'

import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { useWalletDetails, useWalletInfo } from '@cowprotocol/wallet'

import { useToggleWalletModal } from 'legacy/state/application/hooks'

import { useOnSelectNetwork } from 'common/hooks/useOnSelectNetwork'
import { useShouldHideNetworkSelector } from 'common/hooks/useShouldHideNetworkSelector'

interface UseAffiliatePartnerWalletResult {
  account: string | undefined
  chainId: number | undefined
  isConnected: boolean
  isMainnet: boolean
  isUnsupported: boolean
  shouldHideNetworkSelector: boolean
  walletName: string | undefined
  onConnect: () => void
  onSwitchToMainnet: () => void
}

export function useAffiliatePartnerWallet(): UseAffiliatePartnerWalletResult {
  const { account, chainId } = useWalletInfo()
  const { walletName } = useWalletDetails()
  const toggleWalletModal = useToggleWalletModal()
  const onSelectNetwork = useOnSelectNetwork()
  const shouldHideNetworkSelector = useShouldHideNetworkSelector()

  const isMainnet = chainId === SupportedChainId.MAINNET
  const isUnsupported = !!account && !isMainnet

  const onConnect = useCallback(() => toggleWalletModal(), [toggleWalletModal])
  const onSwitchToMainnet = useCallback(() => {
    if (!shouldHideNetworkSelector) {
      onSelectNetwork(SupportedChainId.MAINNET)
    }
  }, [onSelectNetwork, shouldHideNetworkSelector])

  return {
    account,
    chainId,
    isConnected: !!account,
    isMainnet,
    isUnsupported,
    shouldHideNetworkSelector,
    walletName,
    onConnect,
    onSwitchToMainnet,
  }
}
