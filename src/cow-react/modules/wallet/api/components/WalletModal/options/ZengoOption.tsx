import { Connector } from '@web3-react/types'
import ZENGO_ICON_URL from 'assets/images/zengo.svg'
import { ConnectionType, walletConnectConnection } from 'connection'
import { getConnectionName } from 'connection/utils'
import { useIsActiveWallet } from 'hooks/useIsActiveWallet'

import Option from '../Option'
import { useWalletInfo } from '../../../hooks/useWalletInfo'
import { getIsZengoWallet } from 'connection/utils'
import { WC_DISABLED_TEXT } from '../../../constants'

const BASE_PROPS = {
  color: '#4196FC',
  icon: ZENGO_ICON_URL,
  id: 'zengo',
}

export function ZengoOption({ tryActivation }: { tryActivation: (connector: Connector) => void }) {
  const { walletName } = useWalletInfo()

  const isWalletConnect = useIsActiveWallet(walletConnectConnection)
  const isActive = isWalletConnect && getIsZengoWallet(walletName)
  const tooltipText = !isActive && isWalletConnect ? WC_DISABLED_TEXT : null

  return (
    <Option
      {...BASE_PROPS}
      isActive={isActive}
      tooltipText={tooltipText}
      clickable={!isWalletConnect}
      onClick={() => tryActivation(walletConnectConnection.connector)}
      header={getConnectionName(ConnectionType.ZENGO)}
    />
  )
}
