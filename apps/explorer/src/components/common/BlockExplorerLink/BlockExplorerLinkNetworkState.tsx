import React from 'react'

import { useNetworkId } from 'state/network'

import { BlockExplorerLink, Props } from './BlockExplorerLink'

/**
 * BlockExplorerLink which relies on the network state
 */
export function BlockExplorerLinkNetworkState(props: Props): JSX.Element {
  const networkId = useNetworkId() || undefined

  return <BlockExplorerLink {...props} networkId={networkId} />
}
