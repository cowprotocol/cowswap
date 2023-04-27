import { ConnectionType } from '@cow/modules/wallet'
import { useIsActiveWallet } from 'hooks/useIsActiveWallet'
import { walletConnectConnection } from './walletConnect'

import { getConnectionName, getIsAlphaWallet } from '@cow/modules/wallet/api/utils/connection'
import { ConnectWalletOption } from '@cow/modules/wallet/api/pure/ConnectWalletOption'
import { WC_DISABLED_TEXT } from '@cow/modules/wallet/constants'
import { useWalletMetaData } from '@cow/modules/wallet'
import { TryActivation } from '.'

import { default as AlphaImage } from '@cow/modules/wallet/api/assets/alpha.svg'

const alphaOption = {
  color: '#4196FC',
  icon: AlphaImage,
  id: 'alpha',
}

export function AlphaOption({ tryActivation }: { tryActivation: TryActivation }) {
  const { walletName } = useWalletMetaData()

  const isWalletConnect = useIsActiveWallet(walletConnectConnection)
  const isActive = isWalletConnect && getIsAlphaWallet(walletName)
  const tooltipText = !isActive && isWalletConnect ? WC_DISABLED_TEXT : null

  return (
    <ConnectWalletOption
      {...alphaOption}
      isActive={isActive}
      tooltipText={tooltipText}
      clickable={!isWalletConnect}
      onClick={() => tryActivation(walletConnectConnection.connector)}
      header={getConnectionName(ConnectionType.ALPHA)}
    />
  )
}
