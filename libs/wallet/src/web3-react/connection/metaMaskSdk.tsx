import { RPC_URLS } from '@cowprotocol/common-const'
import { initializeConnector } from '@web3-react/core'

import { onError } from './onError'

import { default as MetamaskImage } from '../../api/assets/metamask.png'
import { ConnectWalletOption } from '../../api/pure/ConnectWalletOption'
import { ConnectionType } from '../../api/types'
import { getConnectionName } from '../../api/utils/connection'
import { MetaMaskSDK } from '../connectors/metaMaskSdk'
import { useIsActiveConnection } from '../hooks/useIsActiveConnection'
import { ConnectionOptionProps, Web3ReactConnection } from '../types'

const metaMaskOption = {
  color: '#E8831D',
  icon: MetamaskImage,
  id: 'metamask',
}

const [web3MetaMask, web3MetaMaskHooks] = initializeConnector<MetaMaskSDK>(
  (actions) =>
    new MetaMaskSDK({
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

export const metaMaskSdkConnection: Web3ReactConnection = {
  connector: web3MetaMask,
  hooks: web3MetaMaskHooks,
  type: ConnectionType.METAMASK,
}

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function MetaMaskSdkOption({ tryActivation, selectedWallet }: ConnectionOptionProps) {
  const isActive = useIsActiveConnection(selectedWallet, metaMaskSdkConnection)

  return (
    <ConnectWalletOption
      {...metaMaskOption}
      isActive={isActive}
      onClick={() => tryActivation(metaMaskSdkConnection.connector)}
      header={getConnectionName(ConnectionType.METAMASK)}
    />
  )
}
