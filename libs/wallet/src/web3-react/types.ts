import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { Web3ReactHooks } from '@web3-react/core'
import { Connector } from '@web3-react/types'

import { ConnectionType } from '../api/types'

export interface Web3ReactConnection<T = Connector> {
  connector: T
  hooks: Web3ReactHooks
  type: ConnectionType
  overrideActivate?: (chainId: SupportedChainId) => boolean
}

export type TryActivation = (connector: Connector) => void

export interface ConnectionOptionProps {
  darkMode: boolean
  selectedWallet: string | undefined
  tryActivation: TryActivation
}
