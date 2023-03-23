import { ConnectionType } from '@cow/modules/wallet'
import { useIsActiveWallet } from 'hooks/useIsActiveWallet'
import { walletConnectConnection } from './walletConnect'

import { getConnectionName, getIsAmbireWallet } from '@cow/modules/wallet/api/utils/connection'
import { ConnectWalletOption } from '@cow/modules/wallet/api/pure/ConnectWalletOption'
import { WC_DISABLED_TEXT } from '@cow/modules/wallet/constants'
import { useWalletMetaData } from '@cow/modules/wallet'
import { TryActivation } from '.'

import { default as AmbireImage } from '@cow/modules/wallet/api/assets/ambire.svg'

const ambireOption = {
  color: '#4196FC',
  icon: AmbireImage,
  id: 'ambire',
}

export function AmbireOption({ tryActivation }: { tryActivation: TryActivation }) {
  const { walletName } = useWalletMetaData()

  const isWalletConnect = useIsActiveWallet(walletConnectConnection)
  const isActive = isWalletConnect && getIsAmbireWallet(walletName)
  const tooltipText = !isActive && isWalletConnect ? WC_DISABLED_TEXT : null

  return (
    <ConnectWalletOption
      {...ambireOption}
      isActive={isActive}
      tooltipText={tooltipText}
      clickable={!isWalletConnect}
      onClick={() => tryActivation(walletConnectConnection.connector)}
      header={getConnectionName(ConnectionType.AMBIRE)}
    />
  )
}
