import { Connector } from '@web3-react/types'
import TALLY_WALLET_ICON from '../../../assets/tally.svg'
import { ConnectionType, tallyWalletConnection } from '@cow/modules/wallet/api/utils/connections'
import { getConnectionName, getIsAlphaWallet } from '@cow/modules/wallet/api/utils'
import { useIsActiveWallet } from 'hooks/useIsActiveWallet'

import Option from '../Option'
import { useWalletInfo } from '../../../hooks/useWalletInfo'

const BASE_PROPS = {
  color: '#4196FC',
  icon: TALLY_WALLET_ICON,
  id: 'tally-ho',
}

export function TallyWalletOption({ tryActivation }: { tryActivation: (connector: Connector) => void }) {
  const { walletName } = useWalletInfo()

  const isWalletConnect = useIsActiveWallet(tallyWalletConnection)
  const isActive = isWalletConnect && getIsAlphaWallet(walletName)

  return (
    <Option
      {...BASE_PROPS}
      isActive={isActive}
      clickable={!isWalletConnect}
      onClick={() => tryActivation(tallyWalletConnection.connector)}
      header={getConnectionName(ConnectionType.TALLY_WALLET)}
    />
  )
}
