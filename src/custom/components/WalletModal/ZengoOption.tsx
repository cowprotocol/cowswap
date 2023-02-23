import { Connector } from '@web3-react/types'
import ZENGO_ICON_URL from 'assets/images/zengo.svg'
import { ConnectionType, walletConnectConnection } from 'connection'
import { getConnectionName } from 'connection/utils'
import { useIsActiveWallet } from 'hooks/useIsActiveWallet'

import Option from 'components/WalletModal/Option'
import { useWalletInfo } from '@src/custom/hooks/useWalletInfo'
import { getIsZengoWallet } from 'connection/utils'

const BASE_PROPS = {
  color: '#4196FC',
  icon: ZENGO_ICON_URL,
  id: 'zengo',
}

export function ZengoOption({ tryActivation }: { tryActivation: (connector: Connector) => void }) {
  const { walletName } = useWalletInfo()

  const isWalletConnect = useIsActiveWallet(walletConnectConnection)
  const isActive = isWalletConnect && getIsZengoWallet(walletName)

  return (
    <Option
      {...BASE_PROPS}
      isActive={isActive}
      clickable={!isWalletConnect}
      onClick={() => tryActivation(walletConnectConnection.connector)}
      header={getConnectionName(ConnectionType.ZENGO)}
    />
  )
}
