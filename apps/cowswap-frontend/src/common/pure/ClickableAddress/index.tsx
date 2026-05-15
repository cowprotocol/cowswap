import { ReactNode } from 'react'

import { useMediaQuery } from '@cowprotocol/common-hooks'
import { ExplorerDataType, getExplorerLink, shortenAddress, getIsNativeToken } from '@cowprotocol/common-utils'
import { CopyButton, ExternalLink, Media, Opacity, UI } from '@cowprotocol/ui'

import { useBridgeSupportedNetwork } from 'entities/bridgeProvider'
import styled from 'styled-components/macro'

export type ClickableAddressProps = {
  address: string
  chainId: number
}

const Wrapper = styled.div<{ alwaysShow: boolean }>`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 4px;

  &:hover {
    > button,
    > div {
      opacity: ${Opacity.medium};
    }
  }

  > button,
  > div {
    opacity: ${({ alwaysShow }) => (alwaysShow ? Opacity.medium : Opacity.none)};

    &:hover {
      opacity: ${Opacity.full};
    }
  }
`

const AddressWrapper = styled(ExternalLink)`
  margin: 0;
  line-height: 1;
  font-size: 13px;
  font-weight: 400;
  color: var(${UI.COLOR_TEXT_OPACITY_50});
  opacity: ${Opacity.full};
  text-decoration: none;

  &:hover {
    color: var(${UI.COLOR_TEXT});
    text-decoration: underline;
  }
`

export function ClickableAddress(props: ClickableAddressProps): ReactNode {
  const { address, chainId } = props

  const isMobile = useMediaQuery(Media.upToMedium(false))
  const bridgeNetwork = useBridgeSupportedNetwork(chainId)

  const shortAddress = shortenAddress(address)
  const target = getExplorerLink(chainId, address, ExplorerDataType.TOKEN, bridgeNetwork?.blockExplorer.url)
  const shouldShowAddress = target && !getIsNativeToken(chainId, address)

  return (
    shouldShowAddress && (
      <Wrapper alwaysShow={isMobile}>
        <AddressWrapper href={target}>{shortAddress}</AddressWrapper>
        <CopyButton value={address} iconOnly />
      </Wrapper>
    )
  )
}
