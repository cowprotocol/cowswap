import React from 'react'

import { TokenErc20 } from '@gnosis.pm/dex-js'
import { BlockExplorerLink } from 'components/common/BlockExplorerLink'
import TokenImg from 'components/common/TokenImg'
import styled from 'styled-components/macro'
import { Network } from 'types'
import { abbreviateString, getImageAddress, isNativeToken } from 'utils'

export type Props = { erc20: TokenErc20; network: Network; showAbbreviated?: boolean }

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  flex-flow: wrap;
  font-size: ${({ theme }): string => theme.fontSizeDefault};
`

const NativeWrapper = styled.span`
  color: ${({ theme }): string => theme.textPrimary1};
`

const StyledImg = styled(TokenImg)`
  width: 1.6rem;
  height: 1.6rem;
  margin: 0 0.5rem;
`

export function TokenDisplay(props: Props): JSX.Element {
  const { erc20, network, showAbbreviated } = props

  // Name and symbol are optional on ERC20 spec. Fallback to address when no name,
  // and show no symbol when that's not set
  const tokenLabel = showAbbreviated ? (
    `${erc20.symbol || erc20.name || abbreviateString(erc20.address, 6, 4)}` // Abbreviated
  ) : erc20.name && erc20.symbol ? (
    `${erc20.name} (${erc20.symbol})` // Name and symbol
  ) : !erc20.name && erc20.symbol ? (
    <>
      <i>{abbreviateString(erc20.address, 6, 4)}</i> ({erc20.symbol})
    </> // No name, but symbol exists
  ) : !erc20.name && !erc20.symbol && erc20.address ? (
    <i>{abbreviateString(erc20.address, 6, 4)}</i> // No name, no symbol, just address
  ) : (
    ''
  )
  const imageAddress = getImageAddress(erc20.address, network)

  return (
    <Wrapper>
      <StyledImg address={imageAddress} />
      {isNativeToken(erc20.address) ? (
        // There's nowhere to link when it's a native token, so, only display the symbol
        <NativeWrapper>{erc20.symbol}</NativeWrapper>
      ) : (
        <BlockExplorerLink identifier={erc20.address} type="token" label={tokenLabel} networkId={network} />
      )}
    </Wrapper>
  )
}
