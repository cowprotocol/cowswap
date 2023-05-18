import { initializeConnector } from '@web3-react/core'
import { Network } from '@web3-react/network'

import { RPC_URLS } from 'constants/networks'
import { ConnectionType } from 'modules/wallet'
import { Web3ReactConnection } from '../types'
import { toSupportedChainId } from 'lib/hooks/routing/clientSideSmartOrderRouter'

// Trying to get chainId from URL (#/100/swap)
// eslint-disable-next-line no-restricted-globals
const urlChainIdMatch = location.hash.match(/^#\/(\d{1,9})\D/)
const defaultChainId = (urlChainIdMatch && toSupportedChainId(+urlChainIdMatch[1])) || 1

const [web3Network, web3NetworkHooks] = initializeConnector<Network>(
  (actions) => new Network({ actions, urlMap: RPC_URLS, defaultChainId })
)
export const networkConnection: Web3ReactConnection = {
  connector: web3Network,
  hooks: web3NetworkHooks,
  type: ConnectionType.NETWORK,
}
