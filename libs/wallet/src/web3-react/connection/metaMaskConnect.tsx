import { RPC_URLS } from '@cowprotocol/common-const'
import { initializeConnector } from '@web3-react/core'

import { onError } from './onError'

import { ConnectionType } from '../../api/types'
import { MetaMaskConnect } from '../connectors/metaMaskConnect'
import { Web3ReactConnection } from '../types'

const [web3MetaMask, web3MetaMaskHooks] = initializeConnector<MetaMaskConnect>(
  (actions) =>
    new MetaMaskConnect({
      actions,
      options: {
        dappMetadata: {
          name: 'CoW Swap',
          url: 'https://swap.cow.fi',
        },
        readonlyRPCMap: Object.fromEntries(
          Object.entries(RPC_URLS).map(([chainId, url]) => [`0x${Number(chainId).toString(16)}`, url]),
        ),
      },
      onError,
    }),
)

export const metaMaskConnectConnection: Web3ReactConnection = {
  connector: web3MetaMask,
  hooks: web3MetaMaskHooks,
  type: ConnectionType.METAMASK,
}
