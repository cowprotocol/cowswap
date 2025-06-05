import { getChainInfo } from '@cowprotocol/common-const'
import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { TokenErc20 } from '@gnosis.pm/dex-js'
import { BlockExplorerLink } from 'components/common/BlockExplorerLink'
import { Network } from 'types'
import { abbreviateString, getImageAddress, isNativeToken } from 'utils'

import { Wrapper, NativeWrapper, StyledImg } from './styled'

export type Props = {
  erc20: TokenErc20 & { chainId?: Network | SupportedChainId }
  network: Network
  showAbbreviated?: boolean
  showNetworkName?: boolean
}

export function TokenDisplay(props: Readonly<Props>): React.ReactNode {
  const { erc20, network, showAbbreviated, showNetworkName = false } = props

  let tokenLabelBaseNode: React.ReactElement | string
  if (showAbbreviated) {
    tokenLabelBaseNode = `${erc20.symbol ?? erc20.name ?? abbreviateString(erc20.address, 6, 4)}`
  } else if (erc20.name && erc20.symbol) {
    tokenLabelBaseNode = `${erc20.name} (${erc20.symbol})`
  } else if (!erc20.name && erc20.symbol) {
    tokenLabelBaseNode = (
      <span>
        <i>{abbreviateString(erc20.address, 6, 4)}</i> ({erc20.symbol})
      </span>
    )
  } else if (!erc20.name && !erc20.symbol && erc20.address) {
    tokenLabelBaseNode = <i>{abbreviateString(erc20.address, 6, 4)}</i>
  } else {
    tokenLabelBaseNode = ''
  }

  const effectiveChainId = erc20.chainId ?? network
  let networkNameSuffix = ''
  if (showNetworkName) {
    let fetchedNetworkName = ''
    try {
      const chainInfo = getChainInfo(effectiveChainId as SupportedChainId)
      if (chainInfo && chainInfo.label) {
        fetchedNetworkName = chainInfo.label
      }
    } catch (error) {
      console.warn(`Could not get chain info for chainId: ${effectiveChainId}`, error)
    }
    if (fetchedNetworkName) {
      networkNameSuffix = `${fetchedNetworkName}`
    }
  }

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
