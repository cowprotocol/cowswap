import React from 'react'

import { CHAIN_INFO } from '@cowprotocol/common-const'
import { getIsNativeToken } from '@cowprotocol/common-utils'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { BannerOrientation, InlineBanner } from '@cowprotocol/ui'
import { useWalletProvider } from '@cowprotocol/wallet-provider'
import { Currency } from '@uniswap/sdk-core'

import SVG from 'react-inlinesvg'
import styled from 'styled-components/macro'

const NetworkInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`

export function MetamaskTransactionWarning({ sellToken }: { sellToken: Currency }) {
  const provider = useWalletProvider()
  const ethereumProvider = (provider as unknown as { provider: typeof window.ethereum })?.provider
  const isMetamask = !!ethereumProvider?.isMetaMask && !ethereumProvider.isRabby
  const isNativeSellToken = getIsNativeToken(sellToken)

  if (!isMetamask || !isNativeSellToken) return null

  const chainInfo = CHAIN_INFO[sellToken.chainId as SupportedChainId]

  return (
    <InlineBanner bannerType="danger" orientation={BannerOrientation.Horizontal} iconSize={32}>
      Metamask may not process transactions correctly. Be careful when signing them and check all the details carefully!
      Be sure to check that the transaction will be sent to the network:{' '}
      <NetworkInfo>
        <SVG src={chainInfo.logo.light} height={24} /> <span>{chainInfo.label}</span>
      </NetworkInfo>
    </InlineBanner>
  )
}
