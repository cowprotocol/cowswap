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

const METAMASK_WALLET_NAME = 'MetaMask Wallet'

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
  const [widgetProviderMetaInfo, setWidgetProviderMetaInfo] = useState<ProviderMetaInfoPayload | null>(null)

  const provider = useWalletProvider()
  const walletDetails = useWalletDetails()
  const isMetamaskBrowserExtension = useIsMetamaskBrowserExtensionWallet()
  const isMetamaskViaWalletConnect = walletDetails.walletName === METAMASK_WALLET_NAME

  const rawProvider = provider?.provider as unknown
  const isWidgetMetamaskBrowserExtension = widgetProviderMetaInfo?.providerEip6963Info?.rdns === METAMASK_RDNS
  const isWidgetMetamaskViaWalletConnect = widgetProviderMetaInfo?.providerWcMetadata?.name === METAMASK_WALLET_NAME

  const isMetamask =
    isMetamaskBrowserExtension ||
    isMetamaskViaWalletConnect ||
    isWidgetMetamaskBrowserExtension ||
    isWidgetMetamaskViaWalletConnect
  const isNativeSellToken = getIsNativeToken(sellToken)

  useEffect(() => {
    const isWidgetEthereumProvider = rawProvider instanceof WidgetEthereumProvider

    if (!isWidgetEthereumProvider) return

    rawProvider.onProviderMetaInfo(setWidgetProviderMetaInfo)
  }, [rawProvider])

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
