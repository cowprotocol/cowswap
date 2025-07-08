import { ReactNode } from 'react'

import { type CrossChainOrder, SupportedChainId } from '@cowprotocol/cow-sdk'

import { TokenErc20 } from '@gnosis.pm/dex-js'
import { BlockExplorerLink } from 'components/common/BlockExplorerLink'
import { Network } from 'types'
import { getImageAddress, isNativeToken } from 'utils'

import { useBridgeProviderBuyTokens, useBridgeProviderNetworks } from 'modules/bridge'

import { NativeWrapper, StyledImg, Wrapper } from './styled'
import { getNetworkSuffix, getTokenLabelBaseNode } from './utils'

export type TokenDisplayProps = {
  erc20: TokenErc20 & { chainId?: Network | SupportedChainId }
  network: number
  showAbbreviated?: boolean
  showNetworkName?: boolean
  bridgeProvider?: CrossChainOrder['provider']
}

export function TokenDisplay(props: Readonly<TokenDisplayProps>): ReactNode {
  const { erc20, network, showAbbreviated, bridgeProvider, showNetworkName = false } = props

  const tokenLabelBaseNode = getTokenLabelBaseNode(erc20, showAbbreviated)

  const { data: tokens } = useBridgeProviderBuyTokens(bridgeProvider, network)
  const { data: networks } = useBridgeProviderNetworks(bridgeProvider)

  const tokenInfo = tokens?.[erc20.address.toLowerCase()]
  const tokenLogo = tokenInfo?.logoURI

  const bridgeNetwork = networks?.[network]
  const bridgeBlockExplorer = bridgeNetwork?.blockExplorer

  const effectiveChainId = erc20.chainId ?? network
  const isChainIdSupported = effectiveChainId in SupportedChainId
  const networkNameSuffix = showNetworkName && isChainIdSupported && getNetworkSuffix(effectiveChainId)
  const imageAddress = getImageAddress(erc20.address, network)

  const nativeTokenDisplay = (
    <NativeWrapper>
      {tokenLabelBaseNode}
      {networkNameSuffix && <span>{networkNameSuffix}</span>}
    </NativeWrapper>
  )

  return (
    <Wrapper>
      <StyledImg address={imageAddress} network={network} tokenLogo={tokenLogo} />
      {isNativeToken(erc20.address) ? (
        nativeTokenDisplay
      ) : (
        <>
          <BlockExplorerLink
            identifier={erc20.address}
            type="token"
            label={tokenLabelBaseNode}
            networkId={effectiveChainId}
            explorerUrl={bridgeBlockExplorer?.url}
            explorerTitle={bridgeBlockExplorer?.name}
          />
          {networkNameSuffix && <span>{networkNameSuffix}</span>}
        </>
      )}
    </Wrapper>
  )
}
