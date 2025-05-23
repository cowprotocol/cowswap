import React from 'react'

import { getChainInfo } from '@cowprotocol/common-const'
import { ExplorerDataType, getExplorerLink } from '@cowprotocol/common-utils'
import { NetworkLogo } from '@cowprotocol/ui'
import { Color } from '@cowprotocol/ui'

import { LinkWithPrefixNetwork } from 'components/common/LinkWithPrefixNetwork'
import styled from 'styled-components/macro'

const NetworkName = styled.span`
  margin-left: 0.5rem;
  color: ${Color.explorer_grey};
`

const AddressLinkWrapper = styled.span`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0;
`

export interface AddressLinkProps {
  address: string
  chainId: number
  showIcon?: boolean
  showNetworkName?: boolean
}

export function AddressLink({
  address,
  chainId,
  showIcon = true,
  showNetworkName = true,
}: AddressLinkProps): React.ReactElement {
  const chainInfo = getChainInfo(chainId)

  return (
    <AddressLinkWrapper>
      <LinkWithPrefixNetwork to={getExplorerLink(chainId, address, ExplorerDataType.ADDRESS)} target="_blank">
        {showIcon && <NetworkLogo chainId={chainId} size={16} forceLightMode={true} />}
        {address} ↗
      </LinkWithPrefixNetwork>
      {showNetworkName && <NetworkName>on {chainInfo.label}</NetworkName>}
    </AddressLinkWrapper>
  )
}

// Legacy export for backward compatibility (deprecated)
export function createAddressLinkElement(props: AddressLinkProps): React.ReactElement {
  console.warn('createAddressLinkElement is deprecated, use AddressLink component instead')
  return <AddressLink {...props} />
}

export function getExplorerLinkUrl(chainId: number, hash: string, type: ExplorerDataType): string {
  return getExplorerLink(chainId, hash, type)
}
