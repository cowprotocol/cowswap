import React, { ReactNode } from 'react'

import { getChainInfo } from '@cowprotocol/common-const'
import { ExplorerDataType, getExplorerLink } from '@cowprotocol/common-utils'
import type { CrossChainOrder } from '@cowprotocol/sdk-bridging'
import { Color, NetworkLogo } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

import { useBridgeProviderNetworks } from 'modules/bridge'

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
  bridgeProvider?: CrossChainOrder['provider']
}

export function AddressLink({
  address,
  chainId,
  showIcon,
  showNetworkName,
  bridgeProvider,
}: AddressLinkProps): ReactNode {
  const { data: networks } = useBridgeProviderNetworks(bridgeProvider)

  const bridgeNetwork = networks?.[chainId]
  const bridgeBlockExplorer = bridgeNetwork?.blockExplorer

  const chainLabel = bridgeNetwork?.label || getChainInfo(chainId)?.label

  if (!chainLabel) return null

  return (
    <AddressLinkWrapper>
      <LinkWithPrefixNetwork
        to={getExplorerLink(chainId, address, ExplorerDataType.ADDRESS, bridgeBlockExplorer?.url)}
        target="_blank"
        noPrefix
      >
        <LinkWithNetworkWrapper>
          {(showIcon || showNetworkName) && (
            <NetworkLogo chainId={chainId} size={16} logoUrl={bridgeNetwork?.logo.dark} />
          )}
          {address.toLowerCase()} ↗
        </LinkWithNetworkWrapper>
      </LinkWithPrefixNetwork>
      {showNetworkName && <NetworkName>on {chainLabel}</NetworkName>}
    </AddressLinkWrapper>
  )
}
