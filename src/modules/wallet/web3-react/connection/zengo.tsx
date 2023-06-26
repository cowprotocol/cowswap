import { useIsActiveWallet } from 'legacy/hooks/useIsActiveWallet'

import { ConnectionType } from 'modules/wallet'
import { useWalletMetaData } from 'modules/wallet'
import { default as ZengoImage } from 'modules/wallet/api/assets/zengo.svg'
import { ConnectWalletOption } from 'modules/wallet/api/pure/ConnectWalletOption'
import { getConnectionName, getIsZengoWallet } from 'modules/wallet/api/utils/connection'
import { WC_DISABLED_TEXT } from 'modules/wallet/constants'

import { useFeatureFlags } from 'common/hooks/featureFlags/useFeatureFlags'

import { TryActivation } from '.'

import { walletConnectConnection } from './walletConnect'
import { walletConnectConnectionV2 } from './walletConnectV2'

export const zengoOption = {
  color: '#4196FC',
  icon: ZengoImage,
  id: 'zengo',
}

export function ZengoOption({ tryActivation }: { tryActivation: TryActivation }) {
  const { walletName } = useWalletMetaData()
  const { walletConnectV1Enabled } = useFeatureFlags()

  const connection = walletConnectV1Enabled ? walletConnectConnection : walletConnectConnectionV2

  const isWalletConnect = useIsActiveWallet(connection)
  const isActive = isWalletConnect && getIsZengoWallet(walletName)
  const tooltipText = !isActive && isWalletConnect ? WC_DISABLED_TEXT : null

  return (
    <ConnectWalletOption
      {...zengoOption}
      isActive={isActive}
      tooltipText={tooltipText}
      clickable={!isWalletConnect}
      onClick={() => tryActivation(connection.connector)}
      header={getConnectionName(ConnectionType.ZENGO)}
    />
  )
}
