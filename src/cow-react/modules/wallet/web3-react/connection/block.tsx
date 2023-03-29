import { Connector } from '@web3-react/types'
import { ConnectionType } from '@cow/modules/wallet'
import { getConnectionName } from '@cow/modules/wallet/api/utils/connection'
import { useIsActiveWallet } from 'hooks/useIsActiveWallet'

import { ConnectWalletOption } from '@cow/modules/wallet/api/pure/ConnectWalletOption'
import { initializeConnector } from '@web3-react/core'
import { InjectedWallet } from '@cow/modules/wallet/web3-react/connectors/Injected'
import { Web3ReactConnection } from '../types'

import { default as BlockImage } from '@cow/modules/wallet/api/assets/block.png'

const WALLET_LINK = 'https://blockwallet.io/'
const BASE_PROPS = {
  color: '#4196FC',
  icon: BlockImage,
  id: 'block',
}

const [blockWallet, blockWalletHooks] = initializeConnector<Connector>(
  (actions) =>
    new InjectedWallet({
      actions,
      walletUrl: WALLET_LINK,
      searchKeywords: ['isBlock', 'isBlockWallet'],
    })
)
export const blockWalletConnection: Web3ReactConnection = {
  connector: blockWallet,
  hooks: blockWalletHooks,
  type: ConnectionType.BLOCK,
}

export function BlockWalletOption({ tryActivation }: { tryActivation: (connector: Connector) => void }) {
  const isActive = useIsActiveWallet(blockWalletConnection)

  return (
    <ConnectWalletOption
      {...BASE_PROPS}
      isActive={isActive}
      onClick={() => tryActivation(blockWalletConnection.connector)}
      header={getConnectionName(ConnectionType.BLOCK)}
    />
  )
}
