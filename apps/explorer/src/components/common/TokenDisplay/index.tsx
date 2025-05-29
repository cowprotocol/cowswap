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

function getTokenLabel(erc20: TokenErc20, showAbbreviated?: boolean): React.ReactElement | string {
  if (showAbbreviated) {
    return `${erc20.symbol ?? erc20.name ?? abbreviateString(erc20.address, 6, 4)}`
  }

  if (erc20.name && erc20.symbol) {
    return `${erc20.name} (${erc20.symbol})`
  }

  if (!erc20.name && erc20.symbol) {
    return (
      <span>
        <i>{abbreviateString(erc20.address, 6, 4)}</i> ({erc20.symbol})
      </span>
    )
  }

  if (!erc20.name && !erc20.symbol && erc20.address) {
    return <i>{abbreviateString(erc20.address, 6, 4)}</i>
  }

  return ''
}

export function TokenDisplay(props: Readonly<Props>): React.ReactNode {
  const { erc20, network, showAbbreviated, showNetworkName = false } = props

  const tokenLabelBaseNode = getTokenLabel(erc20, showAbbreviated)

  const effectiveChainId = erc20.chainId ?? network
  const chainInfo = effectiveChainId in SupportedChainId ? getChainInfo(effectiveChainId as SupportedChainId) : null
  const networkNameSuffix = showNetworkName ? chainInfo?.label || '' : ''

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
