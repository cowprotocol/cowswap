import { ReactNode } from 'react'

import { SupportedChainId } from '@cowprotocol/cow-sdk'
import type { CrossChainOrder } from '@cowprotocol/sdk-bridging'

import { TokenErc20 } from '@gnosis.pm/dex-js'
import { BlockExplorerLink } from 'components/common/BlockExplorerLink'
import { Network } from 'types'
import { getImageAddress, isNativeToken } from 'utils'

import { useBridgeProviderBuyTokens, useBridgeProviderNetworks } from 'modules/bridge'

import { NativeWrapper, StyledImg, Wrapper } from './styled'
import { getNetworkSuffix, getTokenLabelBaseNode } from './utils'

export type TokenDisplayProps = {
  erc20: TokenErc20 & { chainId?: Network | SupportedChainId; logoUrl?: string }
  network: number
  showAbbreviated?: boolean
  showNetworkName?: boolean
  bridgeProvider?: CrossChainOrder['provider']
}

// eslint-disable-next-line complexity
export function TokenDisplay(props: Readonly<TokenDisplayProps>): ReactNode {
  const { erc20, network, showAbbreviated, bridgeProvider, showNetworkName = false } = props

  const tokenLabelBaseNode = getTokenLabelBaseNode(erc20, showAbbreviated)

  const { data: tokens } = useBridgeProviderBuyTokens(bridgeProvider, network)
  const { data: networks } = useBridgeProviderNetworks(bridgeProvider)

  const tokenInfo = tokens?.[erc20.address.toLowerCase()]
  const tokenLogo = erc20?.logoUrl || tokenInfo?.logoURI

  const bridgeNetwork = networks?.[network]
  const bridgeBlockExplorer = bridgeNetwork?.blockExplorer

  const effectiveChainId = erc20.chainId ?? network
  const networkNameSuffix = showNetworkName ? getNetworkSuffix(effectiveChainId) || bridgeNetwork?.label : undefined
  const imageAddress = getImageAddress(erc20.address, network)

  const nativeTokenDisplay = (
    <NativeWrapper>
      {tokenLabelBaseNode}
      {networkNameSuffix && <span> {networkNameSuffix}</span>}
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
