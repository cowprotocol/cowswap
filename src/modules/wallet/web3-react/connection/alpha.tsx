import { useIsActiveWallet } from 'legacy/hooks/useIsActiveWallet'

import { ConnectionType } from 'modules/wallet'
import { useWalletMetaData } from 'modules/wallet'
import { default as AlphaImage } from 'modules/wallet/api/assets/alpha.svg'
import { ConnectWalletOption } from 'modules/wallet/api/pure/ConnectWalletOption'
import { getConnectionName, getIsAlphaWallet } from 'modules/wallet/api/utils/connection'
import { WC_DISABLED_TEXT } from 'modules/wallet/constants'

import { useFeatureFlags } from 'common/hooks/featureFlags/useFeatureFlags'

import { TryActivation } from '.'

import { walletConnectConnection } from './walletConnect'
import { walletConnectConnectionV2 } from './walletConnectV2'

const alphaOption = {
  color: '#4196FC',
  icon: AlphaImage,
  id: 'alpha',
}

export function AlphaOption({ tryActivation }: { tryActivation: TryActivation }) {
  const { walletName } = useWalletMetaData()
  const { walletConnectV1Enabled } = useFeatureFlags()

  const connection = walletConnectV1Enabled ? walletConnectConnection : walletConnectConnectionV2

  const isWalletConnect = useIsActiveWallet(connection)
  const isActive = isWalletConnect && getIsAlphaWallet(walletName)
  const tooltipText = !isActive && isWalletConnect ? WC_DISABLED_TEXT : null

  return (
    <ConnectWalletOption
      {...alphaOption}
      isActive={isActive}
      tooltipText={tooltipText}
      clickable={!isWalletConnect}
      onClick={() => tryActivation(connection.connector)}
      header={getConnectionName(ConnectionType.ALPHA)}
    />
  )
}
