import React, { ReactNode } from 'react'

import { getChainInfo } from '@cowprotocol/common-const'
import { ExplorerDataType, getExplorerLink } from '@cowprotocol/common-utils'
import { NetworkLogo } from '@cowprotocol/ui'
import { Color } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

import { LinkWithPrefixNetwork } from './LinkWithPrefixNetwork'

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
const LinkWithNetworkWrapper = styled.span`
  display: flex;
  align-items: center;
  gap: 5px;
`

export interface AddressLinkProps {
  address: string
  chainId: number
  showIcon?: boolean
  showNetworkName: boolean
}

export function AddressLink({ address, chainId, showIcon, showNetworkName }: AddressLinkProps): ReactNode {
  const chainInfo = getChainInfo(chainId)

  if (!chainInfo) return null

  return (
    <AddressLinkWrapper>
      <LinkWithPrefixNetwork to={getExplorerLink(chainId, address, ExplorerDataType.ADDRESS)} target="_blank" noPrefix>
        <LinkWithNetworkWrapper>
          {(showIcon || showNetworkName) && <NetworkLogo chainId={chainId} size={16} forceLightMode={true} />}
          {address} ↗
        </LinkWithNetworkWrapper>
      </LinkWithPrefixNetwork>
      {showNetworkName && <NetworkName>on {chainInfo.label}</NetworkName>}
    </AddressLinkWrapper>
  )
}
