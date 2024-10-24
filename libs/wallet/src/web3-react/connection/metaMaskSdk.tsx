import { RPC_URLS } from '@cowprotocol/common-const'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { initializeConnector } from '@web3-react/core'

import { onError } from './onError'

import { default as MetamaskImage } from '../../api/assets/metamask.png'
import { ConnectWalletOption } from '../../api/pure/ConnectWalletOption'
import { ConnectionType } from '../../api/types'
import { getConnectionName } from '../../api/utils/connection'
import { useIsActiveConnection } from '../hooks/useIsActiveConnection'
import { ConnectionOptionProps, Web3ReactConnection } from '../types'
import { MetaMaskSDK } from '../connectors/metaMaskSdk'

const metaMaskOption = {
  color: '#E8831D',
  icon: MetamaskImage,
  id: 'metamask',
}

const [web3MetaMask, web3MetaMaskHooks] = initializeConnector<MetaMaskSDK>(
  (actions) => new MetaMaskSDK({
    actions, options: {
      dappMetadata: {
        name: 'CoW Swap',
        url: 'https://swap.cow.fi'
      },
      readonlyRPCMap: {
        [`0x${SupportedChainId.MAINNET.toString(16)}`]: RPC_URLS[SupportedChainId.MAINNET]
      },
    }, onError
  })
)

export const metaMaskSdkConnection: Web3ReactConnection = {
  connector: web3MetaMask,
  hooks: web3MetaMaskHooks,
  type: ConnectionType.METAMASK,
}

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
