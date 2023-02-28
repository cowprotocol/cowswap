import { Connector } from '@web3-react/types'
import AMBIRE_ICON_URL from 'assets/images/ambire.svg'
import { ConnectionType, walletConnectConnection } from '@cow/modules/wallet/api/utils/connections'
import { getConnectionName, getIsAmbireWallet } from '@cow/modules/wallet/api/utils'
import { useIsActiveWallet } from 'hooks/useIsActiveWallet'

import Option from '../Option'
import { useWalletInfo } from '../../../hooks/useWalletInfo'
import { WC_DISABLED_TEXT } from '../../../constants'

const BASE_PROPS = {
  color: '#4196FC',
  icon: AMBIRE_ICON_URL,
  id: 'ambire',
}

export function AmbireOption({ tryActivation }: { tryActivation: (connector: Connector) => void }) {
  const { walletName } = useWalletInfo()

  const isWalletConnect = useIsActiveWallet(walletConnectConnection)
  const isActive = isWalletConnect && getIsAmbireWallet(walletName)
  const tooltipText = !isActive && isWalletConnect ? WC_DISABLED_TEXT : null

  return (
    <Option
      {...BASE_PROPS}
      isActive={isActive}
      tooltipText={tooltipText}
      clickable={!isWalletConnect}
      onClick={() => tryActivation(walletConnectConnection.connector)}
      header={getConnectionName(ConnectionType.AMBIRE)}
    />
  )
}
