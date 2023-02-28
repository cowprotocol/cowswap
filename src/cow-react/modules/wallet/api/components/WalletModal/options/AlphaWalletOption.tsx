import { Connector } from '@web3-react/types'
import ALPHA_WALLET_ICON_URL from 'assets/images/alphawallet.svg'
import { ConnectionType, walletConnectConnection } from '@cow/modules/wallet/api/utils/connections'
import { getConnectionName, getIsAlphaWallet } from '@cow/modules/wallet/api/utils'
import { useIsActiveWallet } from 'hooks/useIsActiveWallet'

import Option from '../Option'
import { useWalletInfo } from '../../../hooks/useWalletInfo'

const BASE_PROPS = {
  color: '#4196FC',
  icon: ALPHA_WALLET_ICON_URL,
  id: 'alpha-wallet',
}

export function AlphaWalletOption({ tryActivation }: { tryActivation: (connector: Connector) => void }) {
  const { walletName } = useWalletInfo()

  const isWalletConnect = useIsActiveWallet(walletConnectConnection)
  const isActive = isWalletConnect && getIsAlphaWallet(walletName)

  return (
    <Option
      {...BASE_PROPS}
      isActive={isActive}
      clickable={!isWalletConnect}
      onClick={() => tryActivation(walletConnectConnection.connector)}
      header={getConnectionName(ConnectionType.ALPHA_WALLET)}
    />
  )
}
