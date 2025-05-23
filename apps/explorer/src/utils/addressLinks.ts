import React from 'react'

import { getChainInfo } from '@cowprotocol/common-const'
import { ExplorerDataType, getExplorerLink } from '@cowprotocol/common-utils'
import { NetworkLogo } from '@cowprotocol/ui'

import { LinkWithPrefixNetwork } from 'components/common/LinkWithPrefixNetwork'

export interface AddressLinkProps {
  address: string
  chainId: number
  showIcon?: boolean
  showNetworkName?: boolean
}

export function createAddressLinkElement({
  address,
  chainId,
  showIcon = true,
  showNetworkName = true,
}: AddressLinkProps): React.ReactElement {
  const chainInfo = getChainInfo(chainId)

  return React.createElement(
    'span',
    {},
    React.createElement(
      LinkWithPrefixNetwork,
      {
        to: getExplorerLink(chainId, address, ExplorerDataType.ADDRESS),
        target: '_blank',
      },
      showIcon &&
        React.createElement(NetworkLogo, {
          chainId,
          size: 16,
          forceLightMode: true,
        }),
      `${address} ↗`,
    ),
    showNetworkName &&
      React.createElement(
        'span',
        { style: { marginLeft: '0.5rem', color: 'var(--explorer-grey)' } },
        `on ${chainInfo.label}`,
      ),
  )
}

export function getExplorerLinkUrl(chainId: number, hash: string, type: ExplorerDataType): string {
  return getExplorerLink(chainId, hash, type)
}
