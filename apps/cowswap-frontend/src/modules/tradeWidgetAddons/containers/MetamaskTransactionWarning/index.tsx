import { useEffect, useState } from 'react'

import { CHAIN_INFO } from '@cowprotocol/common-const'
import { getIsNativeToken } from '@cowprotocol/common-utils'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { ProviderMetaInfoPayload, WidgetEthereumProvider } from '@cowprotocol/iframe-transport'
import { InlineBanner } from '@cowprotocol/ui'
import { METAMASK_RDNS, useIsMetamaskBrowserExtensionWallet, useWalletDetails } from '@cowprotocol/wallet'
import { useWalletProvider } from '@cowprotocol/wallet-provider'
import { Currency } from '@uniswap/sdk-core'

import SVG from 'react-inlinesvg'
import styled from 'styled-components/macro'

const METAMASK_WALLET_NAME_REGEX = /metamask/i

const Banner = styled(InlineBanner)`
  font-size: 14px;
  text-align: center;
  width: 100%;
`

const NetworkInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`

export function MetamaskTransactionWarning({ sellToken }: { sellToken: Currency }) {
  const walletDetails = useWalletDetails()
  const isMetamaskBrowserExtension = useIsMetamaskBrowserExtensionWallet()

  const widgetProviderMetaInfo = useWidgetProviderMetaInfo()
  const isMetamaskMobileInjectedBrowser = useIsMetamaskMobileInjectedWallet()

  const isMetamaskViaWalletConnect = METAMASK_WALLET_NAME_REGEX.test(walletDetails.walletName || '')

  const isWidgetMetamaskBrowserExtension = widgetProviderMetaInfo?.providerEip6963Info?.rdns === METAMASK_RDNS
  const isWidgetMetamaskViaWalletConnect = METAMASK_WALLET_NAME_REGEX.test(
    widgetProviderMetaInfo?.providerWcMetadata?.name || '',
  )

  const isMetamask =
    isMetamaskBrowserExtension ||
    isMetamaskViaWalletConnect ||
    isMetamaskMobileInjectedBrowser ||
    isWidgetMetamaskBrowserExtension ||
    isWidgetMetamaskViaWalletConnect
  const isNativeSellToken = getIsNativeToken(sellToken)

  if (!isMetamask || !isNativeSellToken) return null

  const chainInfo = CHAIN_INFO[sellToken.chainId as SupportedChainId]

  return (
    <Banner bannerType="danger" iconSize={32}>
      Issues have been reported with Metamask sending transactions to the wrong chain. Before you sign, please check in
      your wallet that the transaction is being sent to the network:{' '}
      <NetworkInfo>
        <SVG src={chainInfo.logo.light} height={24} width={24} /> <span>{chainInfo.label}</span>
      </NetworkInfo>
    </Banner>
  )
}

function useWidgetProviderMetaInfo() {
  const provider = useWalletProvider()
  const [widgetProviderMetaInfo, setWidgetProviderMetaInfo] = useState<ProviderMetaInfoPayload | null>(null)

  const rawProvider = provider?.provider as unknown

  useEffect(() => {
    const isWidgetEthereumProvider = rawProvider instanceof WidgetEthereumProvider

    if (!isWidgetEthereumProvider) return

    rawProvider.onProviderMetaInfo(setWidgetProviderMetaInfo)
  }, [rawProvider])

  return widgetProviderMetaInfo
}

/**
 * This is hacky way to detect if the wallet is metamask mobile injected wallet
 * Many injected wallet browsers emulate isMetaMask, but only metamask mobile has _metamask
 */
function useIsMetamaskMobileInjectedWallet(): boolean {
  const walletProvider = useWalletProvider()
  const rawProvider = walletProvider?.provider as any

  return Boolean(rawProvider?.isMetaMask && rawProvider._metamask && !rawProvider.isRabby)
}
