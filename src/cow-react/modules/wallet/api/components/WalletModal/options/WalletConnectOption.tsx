import { Connector } from '@web3-react/types'
import WALLET_CONNECT_ICON_URL from '../../../assets/walletConnectIcon.svg'
import { ConnectionType, walletConnectConnection } from '@cow/modules/wallet/api/utils/connections'
import { getConnectionName } from '@cow/modules/wallet/api/utils'
import { useIsActiveWallet } from 'hooks/useIsActiveWallet'

import Option from '../Option'
import { useWalletInfo } from '../../../hooks/useWalletInfo'
import { getIsAmbireWallet, getIsZengoWallet, getIsAlphaWallet } from '@cow/modules/wallet/api/utils'
import { WC_DISABLED_TEXT } from '../../../constants'

const BASE_PROPS = {
  color: '#4196FC',
  icon: WALLET_CONNECT_ICON_URL,
  id: 'wallet-connect',
}

export function WalletConnectOption({ tryActivation }: { tryActivation: (connector: Connector) => void }) {
  const { walletName } = useWalletInfo()

  const isWalletConnect = useIsActiveWallet(walletConnectConnection)
  const isActive =
    isWalletConnect && !getIsZengoWallet(walletName) && !getIsAmbireWallet(walletName) && !getIsAlphaWallet(walletName)
  const tooltipText = !isActive && isWalletConnect ? WC_DISABLED_TEXT : null

  return (
    <Option
      {...BASE_PROPS}
      isActive={isActive}
      tooltipText={tooltipText}
      clickable={!isWalletConnect}
      onClick={() => tryActivation(walletConnectConnection.connector)}
      header={getConnectionName(ConnectionType.WALLET_CONNECT)}
    />
  )
}
