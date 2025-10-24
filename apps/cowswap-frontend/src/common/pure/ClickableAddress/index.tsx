import { ReactNode, useRef } from 'react'

import { useMediaQuery } from '@cowprotocol/common-hooks'
import { ExplorerDataType, getExplorerLink, shortenAddress, getIsNativeToken } from '@cowprotocol/common-utils'
import { Media, ContextMenuTooltip, ContextMenuCopyButton, ContextMenuExternalLink, Opacity, UI } from '@cowprotocol/ui'

import { t } from '@lingui/core/macro'
import { useBridgeSupportedNetwork } from 'entities/bridgeProvider'
import { Info } from 'react-feather'
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
    > button {
      opacity: ${Opacity.medium};
    }
  }

  > button {
    opacity: ${({ alwaysShow }) => (alwaysShow ? Opacity.medium : Opacity.none)};

    &:hover {
      opacity: ${Opacity.full};
    }
  }
`

const AddressWrapper = styled.span`
  margin: 0;
  line-height: 1;
  font-size: 13px;
  font-weight: 400;
  color: var(${UI.COLOR_TEXT_OPACITY_50});
  opacity: ${Opacity.full};
`

export function ClickableAddress(props: ClickableAddressProps): ReactNode {
  const { address, chainId } = props

  const wrapperRef = useRef<HTMLDivElement>(null)
  const isMobile = useMediaQuery(Media.upToMedium(false))
  const bridgeNetwork = useBridgeSupportedNetwork(chainId)

  const shortAddress = shortenAddress(address)
  const target = getExplorerLink(chainId, address, ExplorerDataType.TOKEN, bridgeNetwork?.blockExplorer.url)
  const shouldShowAddress = target && !getIsNativeToken(chainId, address)

  return (
    shouldShowAddress && (
      <Wrapper alwaysShow={isMobile} ref={wrapperRef}>
        <AddressWrapper>{shortAddress}</AddressWrapper>
        <ContextMenuTooltip
          content={
            <>
              <ContextMenuCopyButton address={address} />
              <ContextMenuExternalLink href={target} label={t`View details`} />
            </>
          }
          placement="bottom"
          containerRef={wrapperRef}
        >
          <Info size={16} />
        </ContextMenuTooltip>
      </Wrapper>
    )
  )
}
