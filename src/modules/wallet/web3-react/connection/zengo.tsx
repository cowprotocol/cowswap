import { ConnectionType } from 'modules/wallet'
import { useIsActiveWallet } from 'hooks/useIsActiveWallet'

import { getConnectionName, getIsZengoWallet } from 'modules/wallet/api/utils/connection'
import { ConnectWalletOption } from 'modules/wallet/api/pure/ConnectWalletOption'
import { walletConnectConnection } from './walletConnect'
import { TryActivation } from '.'
import { useWalletMetaData } from 'modules/wallet'
import { WC_DISABLED_TEXT } from 'modules/wallet/constants'

import { default as ZengoImage } from 'modules/wallet/api/assets/zengo.svg'

export const zengoOption = {
  color: '#4196FC',
  icon: ZengoImage,
  id: 'zengo',
}

export function ZengoOption({ tryActivation }: { tryActivation: TryActivation }) {
  const { walletName } = useWalletMetaData()

  const isWalletConnect = useIsActiveWallet(walletConnectConnection)
  const isActive = isWalletConnect && getIsZengoWallet(walletName)
  const tooltipText = !isActive && isWalletConnect ? WC_DISABLED_TEXT : null

  return (
    <ConnectWalletOption
      {...zengoOption}
      isActive={isActive}
      tooltipText={tooltipText}
      clickable={!isWalletConnect}
      onClick={() => tryActivation(walletConnectConnection.connector)}
      header={getConnectionName(ConnectionType.ZENGO)}
    />
  )
}
