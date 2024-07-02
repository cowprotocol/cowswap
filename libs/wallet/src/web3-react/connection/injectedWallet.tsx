import { initializeConnector } from '@web3-react/core'

import { ConnectionType } from '../../api/types'
import { InjectedWallet } from '../connectors/Injected'
import { Web3ReactConnection } from '../types'

const [web3Injected, web3InjectedHooks] = initializeConnector<InjectedWallet>(
  (actions) =>
    new InjectedWallet({
      actions,
      walletUrl: '',
      searchKeywords: [],
    })
)
export const injectedWalletConnection: Web3ReactConnection<InjectedWallet> = {
  connector: web3Injected,
  hooks: web3InjectedHooks,
  type: ConnectionType.INJECTED,
}
