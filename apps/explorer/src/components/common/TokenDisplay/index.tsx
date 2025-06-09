import { ReactNode } from 'react'

import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { TokenErc20 } from '@gnosis.pm/dex-js'
import { BlockExplorerLink } from 'components/common/BlockExplorerLink'
import { Network } from 'types'
import { getImageAddress, isNativeToken } from 'utils'

import { Wrapper, NativeWrapper, StyledImg } from './styled'
import { getNetworkSuffix, getTokenLabelBaseNode } from './utils'

export type TokenDisplayProps = {
  erc20: TokenErc20 & { chainId?: Network | SupportedChainId }
  network: Network
  showAbbreviated?: boolean
  showNetworkName?: boolean
}

export function TokenDisplay(props: Readonly<TokenDisplayProps>): ReactNode {
  const { erc20, network, showAbbreviated, showNetworkName = false } = props

  const tokenLabelBaseNode = getTokenLabelBaseNode(erc20, showAbbreviated)

  const effectiveChainId = erc20.chainId ?? network
  const networkNameSuffix = showNetworkName && getNetworkSuffix(effectiveChainId)
  const imageAddress = getImageAddress(erc20.address, network)

  const nativeTokenDisplay = (
    <NativeWrapper>
      {tokenLabelBaseNode}
      {networkNameSuffix && <span>{networkNameSuffix}</span>}
    </NativeWrapper>
  )

  return (
    <Wrapper>
      <StyledImg address={imageAddress} network={network} />
      {isNativeToken(erc20.address) ? (
        nativeTokenDisplay
      ) : (
        <>
          <BlockExplorerLink
            identifier={erc20.address}
            type="token"
            label={tokenLabelBaseNode}
            networkId={effectiveChainId as SupportedChainId}
          />
          {networkNameSuffix && <span>{networkNameSuffix}</span>}
        </>
      )}
    </Wrapper>
  )
}
