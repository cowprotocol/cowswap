import { ConnectionType } from 'modules/wallet'
import { useIsActiveWallet } from 'legacy/hooks/useIsActiveWallet'
import { walletConnectConnection } from './walletConnect'

import { getConnectionName, getIsAlphaWallet } from 'modules/wallet/api/utils/connection'
import { ConnectWalletOption } from 'modules/wallet/api/pure/ConnectWalletOption'
import { WC_DISABLED_TEXT } from 'modules/wallet/constants'
import { useWalletMetaData } from 'modules/wallet'
import { TryActivation } from '.'

import { default as AlphaImage } from 'modules/wallet/api/assets/alpha.svg'

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
