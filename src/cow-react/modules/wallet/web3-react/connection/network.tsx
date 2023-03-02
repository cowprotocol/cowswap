import { initializeConnector } from '@web3-react/core'
import { Network } from '@web3-react/network'

import { RPC_URLS } from 'constants/networks'
import { ConnectionType } from '@cow/modules/wallet'
import { Web3ReactConnection } from '../types'

const [web3Network, web3NetworkHooks] = initializeConnector<Network>(
  (actions) => new Network({ actions, urlMap: RPC_URLS, defaultChainId: 1 })
)
export const networkConnection: Web3ReactConnection = {
  connector: web3Network,
  hooks: web3NetworkHooks,
  type: ConnectionType.NETWORK,
}
