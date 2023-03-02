import { ConnectionType } from '@cow/modules/wallet'
import { useIsActiveWallet } from 'hooks/useIsActiveWallet'

import { getConnectionName } from '@cow/modules/wallet/api/utils/connection'
import { ConnectWalletOption } from '@cow/modules/wallet/api/pure/ConnectWalletOption'
import { walletConnectConnection } from './walletConnect'
import { TryActivation } from '.'

import { default as ZengoImage } from '@cow/modules/wallet/api/assets/zengo.svg'

export const zengoOption = {
  color: '#4196FC',
  icon: ZengoImage,
  id: 'zengo',
}

export function ZengoOption({ tryActivation }: { tryActivation: TryActivation }) {
  const isActive = useIsActiveWallet(walletConnectConnection)
  return (
    <ConnectWalletOption
      {...zengoOption}
      isActive={isActive}
      onClick={() => tryActivation(walletConnectConnection.connector)}
      header={getConnectionName(ConnectionType.ZENGO)}
    />
  )
}
