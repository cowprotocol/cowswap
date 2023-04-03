import { initializeConnector } from '@web3-react/core'

import { ConnectionType } from '@cow/modules/wallet'
import { Web3ReactConnection } from '../types'
import { AsyncConnector } from './asyncConnector'

const [web3GnosisSafe, web3GnosisSafeHooks] = initializeConnector<AsyncConnector>(
  (actions) =>
    new AsyncConnector(() => import('@web3-react/gnosis-safe').then((m) => new m.GnosisSafe({ actions })), actions)
)
export const gnosisSafeConnection: Web3ReactConnection = {
  connector: web3GnosisSafe,
  hooks: web3GnosisSafeHooks,
  type: ConnectionType.GNOSIS_SAFE,
}
