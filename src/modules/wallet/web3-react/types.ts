import { Web3ReactHooks } from '@web3-react/core'
import { Connector } from '@web3-react/types'
import { ConnectionType } from 'modules/wallet'

export interface Web3ReactConnection {
  connector: Connector
  hooks: Web3ReactHooks
  type: ConnectionType
}
