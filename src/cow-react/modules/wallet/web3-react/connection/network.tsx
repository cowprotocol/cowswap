import { initializeConnector } from '@web3-react/core'
import { Network } from '@web3-react/network'

import { ConnectionType } from '@cow/modules/wallet'
import { Web3ReactConnection } from '../types'
import { PROVIDERS } from '@src/custom/constants/networks'

const [web3Network, web3NetworkHooks] = initializeConnector<Network>(
  (actions) => new Network({ actions, urlMap: PROVIDERS })
)
export const networkConnection: Web3ReactConnection = {
  connector: web3Network,
  hooks: web3NetworkHooks,
  type: ConnectionType.NETWORK,
}
