import { Connector } from '@web3-react/types'
import BLOCK_WALLET_ICON_URL from '../../../assets/block-wallet.png'
import { ConnectionType, blockWalletConnection } from '@cow/modules/wallet/api/utils/connections'
import { getConnectionName } from '@cow/modules/wallet/api/utils'
import { useIsActiveWallet } from 'hooks/useIsActiveWallet'

import Option from '../Option'

const BASE_PROPS = {
  color: '#4196FC',
  icon: BLOCK_WALLET_ICON_URL,
  id: 'block-wallet',
}

export function BlockWalletOption({ tryActivation }: { tryActivation: (connector: Connector) => void }) {
  const isActive = useIsActiveWallet(blockWalletConnection)

  return (
    <Option
      {...BASE_PROPS}
      isActive={isActive}
      onClick={() => tryActivation(blockWalletConnection.connector)}
      header={getConnectionName(ConnectionType.BLOCK_WALLET)}
    />
  )
}
