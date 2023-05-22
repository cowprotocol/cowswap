import { ConnectionType } from 'modules/wallet'
import { useIsActiveWallet } from 'legacy/hooks/useIsActiveWallet'
import { walletConnectConnection } from './walletConnect'

import { getConnectionName, getIsAmbireWallet } from 'modules/wallet/api/utils/connection'
import { ConnectWalletOption } from 'modules/wallet/api/pure/ConnectWalletOption'
import { WC_DISABLED_TEXT } from 'modules/wallet/constants'
import { useWalletMetaData } from 'modules/wallet'
import { TryActivation } from '.'

import { default as AmbireImage } from 'modules/wallet/api/assets/ambire.svg'

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
